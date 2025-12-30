function switchview(e,switchview,extension) {
	if (switchview =='switchviewdetail') {
		$('.widgetWrapper_'+extension).find('.cdr-details').show();
		$('.widgetWrapper_'+extension).find('.cdr-graph').hide();
	}else {
		$('.widgetWrapper_'+extension).find('.cdr-graph').show();
		$('.widgetWrapper_'+extension).find('.cdr-details').hide();
        transform_Chart('callTypeChart_'+extension, 'bar');
        transform_Chart('timeIndicatorChart_'+extension, 'bar');
        transform_Chart('destinationTypeChart_'+extension, 'bar');
		transform_Chart('averageMesChart_'+extension, 'bar');
	}
}

let chartObj = {};

function getGraphData(extensions = false, dateRange, id = false, showColumns = false, breakdownType = 'hour') {
	c3.chart.internal.beforeinit = function () {
		this.plugins.zoom = d3.behavior.zoom();
	};
	let chart_id=id+'_'+extensions;
	$.post("ajax.php?module=cdrpro&command=getReportWidget", { extensions, breakdownType, dateRange})
		.done(function (response) {
			$('.graph-loader').hide();
			if (response && response.length) {
				let xaxis = [];
				let columns = [];
				let fieldName = Object.keys(response[0]);
				
				for (let i = 0; i < fieldName.length; i++) {
					const field = fieldName[i];
					if (i > 0) {
						columns.push([field])
					}
				}
				Object.keys(response).forEach((key, i) => {
					for (let j = 0; j < fieldName.length; j++) {
						if (j == 0) {
							xaxis.push(response[key][fieldName[j]])
						} else {
							columns[j - 1].push(response[key][fieldName[j]])
						}
					}
				})
				let zoom = {
					enabled: false,
				};
				if (columns[0].length > 20) {
					zoom = {
						enabled: true,
						extent: [1, 5], // This sets the default zoom level to be between 1x and 2x
					};
				} 
				if(showColumns) {
					columns = columns.filter(column => showColumns.includes(column[0]));
				}
				let dataExists = true;
				// columns.forEach(column => {
				// 	if (!column[1]) {
				// 		dataExists = false
				// 	}
				// });
				dataExists = columns.some(function(val){
					return val != null && val != 'undefined';
				})
				if (dataExists) {
					let chartType='bar';
					chartObj[chart_id] = c3.generate({
						bindto: `#${chart_id}`,
						data: {
							columns: columns,
							type: chartType,
							labels: {
								format: function(value) {
								  return value
								}
							  }
						},
						zoom: zoom,
						axis: {
							x: {
								type: 'category',
								categories: xaxis
							},
							y: {
								tick: {
								  format: function(value) {
									if (showColumns[0] == 'Avg RX MES' || showColumns[0] == 'avg_RX_MES') {
										return value;
									} else {
										if (value % 1 !== 0) {
											return '';
										}   else {
											return value;
										}
									}
								  }
								}
							  }
						}
					});
				}else {
					$(`#${chart_id}`).html(` <b> ${_('Data Not Found')}</b> `);
				}
			} else {
				$(`#${chart_id}`).html(` <b> ${_('Data Not Found')}</b> `)
			}
		})
		.fail(function (xhr, status, error) {
			$(`#${chart_id}`).html(` <b> ${_('Data Not Found')}</b> `)
		});
}
function getDestinationTypeChart(extensions = false, dateRange, id = false, showColumns = false, breakdownType = false) {
let chart_id=id+'_'+extensions;
$.post("ajax.php?module=cdrpro&command=getReportWidget", { extensions, breakdownType, dateRange})
		.done(function (response) {
	if (response.status) {
		if (response.data.length > 0) {
			let xaxis = [];
			let totalSum = 0;
			
			const columns = response.data.map(item => {
				totalSum += parseInt(item.totalCalls);
				return [item.call_type, parseInt(item.totalCalls)]
			});
			xaxis.push(totalSum);
			let chartType='bar';
			chartObj[chart_id] = c3.generate({
				bindto:`#${chart_id}`,
				data: {
				columns: columns,
				type: chartType,
				labels: {
					format: function(value) {
					  return value;
					}
				  }
				},
				axis: {
					x: {
						type: 'category',
						categories: xaxis
					},
					y: {
						tick: {
						  format: function(value) {
							if (value % 1 !== 0) {
								return '';
							}   else {
								return value;
							}
						  }
						}
					  } 
				}
			});
		} else {
			$(`#${chart_id}`).html(` <b> ${_('Data Not Found')}</b> `);
		}
	} else {
		if (response.message) {
			fpbxToast(_(response.message), _('Error'), 'error');
		}
	}
});
}

function camelCaseToNormalText(text) {
	if (text.match(/[^A-Z]/)) {
		const result = text.replace(/(?<=[^A-Z])[A-Z](?=[^A-Z])/g, " $&");
		return result.charAt(0).toUpperCase() + result.slice(1);
	}
	return text;
}
function generateReport(extension) {
	$.get("ajax.php?module=cdrpro",
		{
			command: 'getCDRlist',
			extensions: extension,
			dateRange : $('#filter_date_time_'+extension).val(),
			fetchalldata: 'true'
		},
		function(data,status){
			$('#toolbar-cdr-widget_'+extension).hide();
			if(data){
				if (data.rows.length >0) {
					$('#toolbar-cdr-widget_'+extension).show();
				}
				$('#cdrTableView-widget_'+extension).bootstrapTable('destroy');
				let keys = Object.keys(Object.assign({}, ...data.rows));
				let columns = [];
				for (let col = 0; col < keys.length; col++) {
					if (keys[col] != 'id' && keys[col] != 'recordingfile' && keys[col] != 'dialData' && keys[col] != '_call_time'
					&& keys[col] != 'avg_RX_MES' && keys[col] != 'avg_TX_MES' && keys[col] != 'callerIdName' && keys[col] != 'accountcode' && keys[col] != 'userfield' && keys[col] != 'converttotext') {
						let colTitle = camelCaseToNormalText(keys[col]);
						if (keys[col] == 'callDate') {
							columns.push({
								title: colTitle,
								field: keys[col],
								sortable: true,
								formatter: function (value) {
									var timestamp = Date.parse(value) / 1000;
									return UCP.dateTimeFormatter(timestamp);
								}
							});
						}else {
							
							columns.push({
								title: colTitle,
								field: keys[col],
								sortable: true,
							});
						}
					}
				}
				columns.push({
					title: 'Actions',
					field: '',
					formatter: (value, row, index) => {
						let html = ''
						if (row && row.recordingfile) {
							html += `<i class="fa fa-play cursor-pointer" title="${_('Play call recordings')}" aria-hidden="true" onClick="playRecording('${row.recordingfile}','${row.callDate}','${extension}')"></i>`;
							html += `<i class="fa fa-download cursor-pointer" title="${_('Download call recordings')}" aria-hidden="true" onClick="callrecordingdownload('${row.recordingfile}','${row.callDate}','${extension}')"></i>`;
						}
						if((row.converttotext !== undefined) && row.converttotext.transcriptionURL !== undefined && row.converttotext.transcriptionURL !== null && row.converttotext.transcriptionURL != '') {
							html += '<a href="#" class = "transcript" title="Read the voice transcription" onclick="openmodalUCP(\'' + row.converttotext.transcriptionURL + '\')"><img src="'+row.converttotext.scribeIconURL+'" width="15px" height="15px" alt="PBX Scribe" /></a>';
						}
						return html;
					}
				});
				$('#cdrTableView-widget_'+extension).bootstrapTable({
							striped: true,
							pagination: true,
							showColumns: true,
							showToggle: true,
							showExport: false,
							sortable: true,
							search: true,
							pageSize: 25,
							pageList: [25, 50, 100, 500],
							columns: columns,
							data: data.rows,
							checkboxEnabled: false,
							toolbar: '#toolbar-cdr-widget_'+extension
						});
			}
	});
	getGraphData(extension,$('#filter_date_time_'+extension).val(),'callTypeChart',['missedCalls','answeredCalls'],'');
	getGraphData(extension,$('#filter_date_time_'+extension).val(),'timeIndicatorChart',['totalCalls']);
	getGraphData(extension,$('#filter_date_time_'+extension).val(),'averageMesChart',['avg_RX_MES','avg_TX_MES']);
	getDestinationTypeChart(extension,$('#filter_date_time_'+extension).val(),'destinationTypeChart',false,'destination');
}

function widgetExportData(extension) {
    let datetime = $('#filter_date_time_'+extension).val()
    let exportType = $('#exportType-widget_'+extension).val();
    if (exportType == 'pdf') {
        let cdrData = $('#cdrTableView').bootstrapTable('getData').length;
        if (cdrData > 70000) {
            fpbxConfirm(
                sprintf(_('Exporting %s CDR records as PDF may take a considerable amount of time. We suggest using alternative export formats for large datasets to expedite the process. Are you sure that you want to proceed with PDF export?'), cdrData),
                _("Yes"), _("No"),
                function () {
                    window.open(`ajax.php?module=cdrpro&command=exportCdrData&datetime=${datetime}&format=${exportType}&extensions=${extension}`);
                }
            );
        } else {
            window.open(`ajax.php?module=cdrpro&command=exportCdrData&datetime=${datetime}&format=${exportType}&extensions=${extension}`);
        }
    } else {
        window.open(`ajax.php?module=cdrpro&command=exportCdrData&datetime=${datetime}&format=${exportType}&extensions=${extension}`);
    }
}

function playRecording(fileName, calldate, extension) {
    var dateObj = new Date(calldate);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    month = ('0' + month).slice(-2)
    var day = dateObj.getUTCDate();
    day = ('0' + day).slice(-2)
    var year = dateObj.getUTCFullYear();
	$('#detailModal_'+extension).css('top','15%');
    $('#detailModal_'+extension+' .modal-title').html(`${_('Recordings')}`);
    $('#detailModal_'+extension+' .modal-body').html(``);

    let player = '<div id="jquery_jplayer" class="jp-jplayer" data-container="#jp_container" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '" data-file="' + encodeURIComponent(fileName) + '" data-ext="'+ extension +'"></div><div id="jp_container" data-player="jquery_jplayer" class="jp-audio-freepbx" role="application" aria-label="media player">' +
        '<div class="jp-type-single">' +
        '<div class="jp-gui jp-interface">' +
        '<div class="jp-controls">' +
        '<i class="fa fa-play jp-play"></i>' +
        '<i class="fa fa-undo jp-restart"></i>' +
        '</div>' +
        '<div class="jp-progress">' +
        '<div class="jp-seek-bar progress">' +
        '<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>' +
        '<div class="progress-bar progress-bar-striped active" style="width: 100%;"></div>' +
        '<div class="jp-play-bar progress-bar"></div>' +
        '<div class="jp-play-bar">' +
        '<div class="jp-ball"></div>' +
        '</div>' +
        '<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>' +
        '</div>' +
        '</div>' +
        '<div class="jp-volume-controls">' +
        '<i class="fa fa-volume-up jp-mute"></i>' +
        '<i class="fa fa-volume-off jp-unmute"></i>' +
        '</div>' +
        '</div>' +
        '<div class="jp-no-solution">' +
        '<span>Update Required</span>' +
        sprintf(_("You are missing support for playback in this browser. To fully support HTML5 browser playback you will need to install programs that can not be distributed with the PBX. If you'd like to install the binaries needed for these conversions click <a href='%s'>here</a>"), "http://wiki.freepbx.org/display/FOP/Installing+Media+Conversion+Libraries") +
        '</div>' +
        '</div>' +
        '</div>';
    $('#detailModal_'+extension+' .modal-body').html(player);
    $('#detailModal_'+extension).modal('show');
	$('.modal-backdrop').hide();
    bindPlayers();
}

function callrecordingdownload(fileName, calldate, ext) {
    var dateObj = new Date(calldate);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    month = ('0' + month).slice(-2)
    var day = dateObj.getUTCDate();
    day = ('0' + day).slice(-2)
    var year = dateObj.getUTCFullYear();
    window.open(`ajax.php?module=cdrpro&command=callrecordingdownload&ext=${ext}&file=${fileName}&year=${year}&month=${month}&day=${day}`);
}

function openmodalUCP(turl) {
	const getExtAndMsgID = turl.split('&');
	let filename='';
	if(getExtAndMsgID[4] !==undefined) {
		filename = "&"+getExtAndMsgID[4];
	}
	var result = $.ajax({
		url: UCP.ajaxUrl+"?module=scribe&command=gettranscriptUcp&"+getExtAndMsgID[2]+"&"+getExtAndMsgID[3]+filename+"&UCPActionTrigger=cdrpro",
		type: 'POST',
		async: false
	});
	result = JSON.parse(result.responseText);
	$("#datamodal").remove();
	const modalWrapper = document.createElement('div');
	modalWrapper.innerHTML = result.html;
	document.body.appendChild(modalWrapper);
    $("#datamodal").modal('show');
}

function bindPlayers() {
    $(".jp-jplayer").each(function () {
        var container = $(this).data("container"),
            player = $(this),
            file = $(this).data("file"),
            year = $(this).data("year"),
            month = $(this).data("month"),
			ext = $(this).data("ext"),
            day = $(this).data("day");
        $(this).jPlayer({
            ready: function () {
                $(container + " .jp-play").click(function () {
                    if (!player.data("jPlayer").status.srcSet) {
                        $(container).addClass("jp-state-loading");
                        $.ajax({
                            type: 'POST',
                            url: "ajax.php",
                            data: { module: "cdrpro", command: "gethtml5", file: file, year: year, month: month, day: day, ext:ext},
                            dataType: 'json',
                            timeout: 120000,
                            success: function (data) {
                                if (data.status) {
                                    player.on($.jPlayer.event.error, function (event) {
                                        $(container).removeClass("jp-state-loading");
                                    });
                                    player.one($.jPlayer.event.canplay, function (event) {
                                        $(container).removeClass("jp-state-loading");
                                        player.jPlayer("play");
                                    });
                                    player.jPlayer("setMedia", data.files);
                                } else {
                                    alert(data.message);
                                    $(container).removeClass("jp-state-loading");
                                }
                            },
                            error: function (jqXHR, textStatus) {
                                if (textStatus === 'timeout') {
                                    $('#notie-alert-outer').html("");
                                    alert("Error in playing the file due to large file size");
                                    $($this).jPlayer("pause", 0);
                                    $(container).removeClass("jp-state-loading");
                                    $(container).addClass("jp-play");
                                }

                            }
                        });
                    }
                });
                var $this = this;
                $(container).find(".jp-restart").click(function () {
                    if ($($this).data("jPlayer").status.paused) {
                        $($this).jPlayer("pause", 0);
                    } else {
                        $($this).jPlayer("play", 0);
                    }
                });
            },
            timeupdate: function (event) {
                $(container).find(".jp-ball").css("left", event.jPlayer.status.currentPercentAbsolute + "%");
            },
            ended: function (event) {
                $(container).find(".jp-ball").css("left", "0%");
            },
            swfPath: "/js",
            supplied: supportedHTML5,
            cssSelectorAncestor: container,
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true
        });
        $(this).on($.jPlayer.event.play, function (event) {
            $(this).jPlayer("pauseOthers");
        });
        $("#detailModal").on("hide.bs.modal", function () {
            player.jPlayer("pause");
        });
    });

    var acontainer = null;
    $('.jp-play-bar').mousedown(function (e) {
        acontainer = $(this).parents(".jp-audio-freepbx");
        updatebar(e.pageX);
    });
    $(document).mouseup(function (e) {
        if (acontainer) {
            updatebar(e.pageX);
            acontainer = null;
        }
    });
    $(document).mousemove(function (e) {
        if (acontainer) {
            updatebar(e.pageX);
        }
    });

    //update Progress Bar control
    var updatebar = function (x) {
        var player = $("#" + acontainer.data("player")),
            progress = acontainer.find('.jp-progress'),
            maxduration = player.data("jPlayer").status.duration,
            position = x - progress.offset().left,
            percentage = 100 * position / progress.width();

        //Check within range
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }

        player.jPlayer("playHead", percentage);

        //Update progress bar and video currenttime
        acontainer.find('.jp-ball').css('left', percentage + '%');
        acontainer.find('.jp-play-bar').css('width', percentage + '%');
        player.jPlayer.currentTime = maxduration * percentage / 100;
    };
}

function closemodalCdrpro() {
	$("#datamodal").modal('hide');
	$("#datamodal").remove();
}