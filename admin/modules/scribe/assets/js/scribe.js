let graphs = {};
let isUserScrolling = false;
let scrollTimeout;
var hasRedirected = false;
const sentimentAssets = {
    neutral: ['rgb(237, 186, 86)'],
    positive: ['rgb(82, 196, 26)'],
    negative: ['rgb(250, 111, 113)']
};
const noDataText = _('No Data Found');
const moduleName = 'scribe';
$(document).ready(function () {
	if (typeof(window.displayUrl) =='undefined') {
        var path = window.location.pathname.toString().split('/').filter(Boolean);
        if (typeof(window.location.origin) === 'undefined') {
            window.location.origin = window.location.protocol + '//' + window.location.host;
        }
        window.displayUrl = window.location.origin + '/' + path.join('/');
	}
    var queryString = window.location.search;
    $.get("/admin/ajax.php?module="+moduleName+"&command=getLicenseStatus").done(function (isLicensed) {
        if (isLicensed.message === 'false') {
            viewCostPredictor();
        }else{
         $('#table-scribeTranscripts').on('post-body.bs.table', function () {
                $('.keep-open ul li:contains("Extension")').remove();
            });
            // document.getElementById('voicemailEmailSettingModal').addEventListener('click', voicemailEmailSettingModal);
            var urlParams = new URLSearchParams(queryString);
            if (!urlParams.has('view')) {
                $.post("/admin/ajax.php?module="+moduleName+"&command=getUsageDetails").done(function (data) {
                    let vmTotalMins = data['voicemail']['totalDuration'];
                    let tts = data['tts']['totalDuration'];
                    let crTotalMins = data['callrecording']['totalDuration'];
                    vmTotalMins = Math.round((vmTotalMins / 60) * 100) / 100;
                    tts = Math.round((tts / 60) * 100) / 100;
                    crTotalMins = Math.round((crTotalMins / 60) * 100) / 100;
                    const uploadTotalMins = data['uploaded_files'] ? Math.round((data['uploaded_files']['totalDuration'] / 60) * 100) / 100 : 0;
                    const remainingTime = data['remainingTotalMinutes'];
                    if((remainingTime <= 0) && vmTotalMins == 0 && crTotalMins == 0 && uploadTotalMins == 0 && tts == 0) {
                        transColmun    = [
                                                ['No Data', 0.01]
                                         ];
                        transColors    = ['#cccccc'];
                    }else{
                        transColmun     =  [
                                                ["Voicemail", vmTotalMins],
                                                ["Call Recording", crTotalMins],
                                                ["Uploaded Files", uploadTotalMins],
                                                ["Text To Speech", tts],
                                                ["Remaining", remainingTime],
                                            ];
                        transColors    = ['#00a8a6','#dd6e00','#9f4e96','#099F24'];
                        let transUl= document.getElementById('transUL')
                        let transVmTotal = formatSeconds(vmTotalMins * 60);
                        let transTtsTotal = formatSeconds(tts * 60);
                        let transCrTotal = formatSeconds(crTotalMins * 60)
                        let transUploadTotal = formatSeconds(uploadTotalMins * 60)
                        let transRemaning = formatSeconds(remainingTime * 60)
                        transVmTotal = transVmTotal?transVmTotal:0;
                        transTtsTotal = transTtsTotal?transTtsTotal:0;
                        transCrTotal = transCrTotal?transCrTotal:0;
                        transUploadTotal = transUploadTotal?transUploadTotal:0;
                        var transLi =document.createElement('li');
                        transLi.textContent = "Total Licensed Minutes : "+data['get_license_totalmins'];
                        transUl.append(transLi);
                        var transLi =document.createElement('li');
                        transLi.textContent = "Call Recording : "+transCrTotal;
                        transUl.append(transLi);
                        var transLi =document.createElement('li');
                        transLi.textContent = "Voicemail : "+transVmTotal;
                        transUl.append(transLi);
                        var transLi =document.createElement('li');
                        transLi.textContent = "Uploaded Audio Files : "+transUploadTotal;
                        transUl.append(transLi);
                        var transLi =document.createElement('li');
                        transLi.textContent = "Text To Speech : "+transTtsTotal;
                        transUl.append(transLi);
                        var transLi =document.createElement('li');
                        transLi.textContent = "Remaining Licensed Minutes : "+transRemaning;
                        transUl.append(transLi);
                    //    transusageoverly.append(transUl);

                       if ($('#callrecording_user').length) {
                            $('#callrecording_user').text(data['callrecording_user']);
                        }
                        if ($('#voicemail_user').length) {
                            $('#voicemail_user').text(data['voicemail_user']);
                        }
                    }
                 graphs.transUsage = c3.generate({
                        bindto: '#transUsage',
                        data: {
                            columns: transColmun ,
                            type: 'donut',
                        },
                        axis: {
                            x: {
                                show: false,
                            },
                            y: {
                                label: "minutes",
                            }
                        },
                        tooltip: {
                            grouped: false,
                            format: {
                                title: function (d) { return ''; },
                                value: function (value, ratio, id) {
                                    var formattedTime = (value === 0.01) ? "0 seconds" : formatSeconds(value * 60);
                                    return formattedTime;
                                }
                            }
                        },
                        donut: {
                            title: _("Scribe Usage")
                        },color:{
                            pattern:transColors
                        },
                        bar: {
                            width: {
                                ratio: 0.5
                            }},
                    });
                });
                
                renderTranscriptGraphs();
            }

            var postcallToggle = getPostCallRecordingSettings();
            if (postcallToggle === "enabled") {
                let postcallelem = document.getElementById("post_call_enable");
                if(postcallelem){
                    document.getElementById("post_call_enable").checked = true;
                }
            } else if (postcallToggle === "disabled") {
                let postcalldiselem = document.getElementById("post_call_enable");
                if(postcalldiselem){
                    document.getElementById("post_call_disable").checked = true;
                }
            }
            var voicemailEmailToggle = getVoicemailEmailSettings();
            if (voicemailEmailToggle === "enabled") {
                let postvoicemailenbelem = document.getElementById("voicemail_email_enable");
                if(postvoicemailenbelem){
                    document.getElementById("voicemail_email_enable").checked = true;
                }
            } else if (voicemailEmailToggle === "disabled") {
                let postvoicemaildiselem = document.getElementById("voicemail_email_disable");
                if(postvoicemaildiselem){
                    document.getElementById("voicemail_email_disable").checked = true;
                }
            }

            //scribe language 
            var getDefaultLanguage = listAllAndDefaultLanguge();
        }
    });

      $("#playbackTranscriptionModal .modal-content").css({
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%)'
    });
    $('#playbackTranscriptionModal .resizable').resizable({
        minWidth: 300,    // Set minimum width (pixels)
        minHeight: 200,   // Set minimum height (pixels)
        resize: function(event, ui) {
            // Optional: any additional logic during resize can be added here
        }
    });

    $(document).on('show.bs.modal', '#playbackTranscriptionModal', function () {
        const modalContent = $(this).find('.modal-content');
        modalContent.css({
            position: 'relative',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%)',
            width: '100%',
            height: '404px',
            maxWidth: '90vw', 
            overflowY: 'auto',
            resize: 'both',
            display: 'flex',
            flexDirection: 'column'
        });
    });

    $(document).on("click", ".tagdetailview", function(event) {
        event.preventDefault();
        opnTagdetailModal($(this));
    });

    $('.mailsetting').hover(function(){
        $(".mailsettingdiv").not($(this).next(".mailsettingdiv")).fadeOut('slow');
        $(this).next('.mailsettingdiv').fadeIn('slow');
    });

    $('.mailsetting,.mailsettingdiv').mouseleave(function(){
       setTimeout(function(){
        if (!$(".mailsetting:hover, .mailsettingdiv:hover").length) {
            $(".mailsettingdiv").fadeOut('slow');
        }
       },2000);
    });
});


function renderTranscriptGraphs() {
    $.post(`ajax.php?module=${moduleName}&command=getTranscripts&dashboard=1`).done(function (data) {
        const dataval = data.data;
        const startdate = data.startdate;
        const enddate   = data.enddate;
        localStorage.setItem('startdate',startdate)
        localStorage.setItem('enddate',enddate)
        let voiceInboundDuration =  dataval.filter(elm => elm.status === 'completed')
                                    .filter(elm1 => elm1.filetype === 'voicemail')
                                    .filter(elm2 => elm2.callDirection.toLowerCase() === 'inbound')
                                    .reduce((elm, val) => elm + parseInt(val.duration), 0) || 0;
        let voiceInternalDuration = dataval.filter(elm => elm.status === 'completed')
                                    .filter(elm1 => elm1.filetype === 'voicemail')
                                    .filter(elm2 => elm2.callDirection.toLowerCase() === 'internal')
                                    .reduce((elm, val) => elm + parseInt(val.duration), 0) || 0;
        if (voiceInboundDuration <= 0 && voiceInternalDuration <= 0) {
                voiceClm    = [
                                ['No Data',0.01]
                              ];
                colors      = ['#cccccc'];

            }else{

                voiceClm = [
                                ['inbound', voiceInboundDuration],
                                ['internal', voiceInternalDuration]
                           ];
                colors  = ['#5799C7', '#61B861'];
            }
        xaxis   = ['Inbound', 'outbound', 'Neutral'];
        chartObj['vmGraph'] = c3.generate({
            bindto: '#vmGraph',
            data: {
                columns: voiceClm,
                type: 'donut',
            },
            axis: {
                x: {
                    show: false,
                },
                y: {
                    label: "minutes",
                }
            },
            tooltip: {
                grouped: false,
                format: {
                    title: function (d) { return ''; },
                    value: function (value, ratio, id) {
                        var formattedTime = (value === 0.01) ? "0 seconds" : formatSeconds(value);
                        return formattedTime;
                    }
                }
            },
            oninit: function() {
                d3.select('#vmGraph').selectAll('.c3-target-inbound').on('click', function(event, d) {
                    handleBarClick(event,d,'inbound','voicemail');
                });
                d3.select('#vmGraph').selectAll('.c3-target-internal').on('click', function(event, d) {
                    handleBarClick(event,d,'internal','voicemail');
                });
                d3.select('#vmGraph').selectAll(".c3-chart-bar.c3-target-internal").on('click',function(event,d){
                    handleBarClick(event,d,'internal','voicemail');
                });
                d3.select('#vmGraph').selectAll(".c3-chart-bar.c3-target-inbound").on('click',function(event,d){
                    handleBarClick(event,d,'inbound','voicemail');
                });
            },
            donut: {
                title: _("Voicemail Usage")
            },
            color:{
                pattern:colors
            }
        });

        let callInboundDuration =   dataval.filter(elm => elm.status === 'completed')
                                    .filter(elm1 => elm1.filetype === 'callrecording')
                                    .filter(elm2 => elm2.callDirection.toLowerCase() === 'inbound')
                                    .reduce((elm, val) => elm + parseInt(val.duration), 0) || 0;
        let callOutboundDuration = dataval.filter(elm => elm.status === 'completed')
                                    .filter(elm1 => elm1.filetype === 'callrecording')
                                    .filter(elm2 => elm2.callDirection.toLowerCase() === 'outbound')
                                    .reduce((elm, val) => elm + parseInt(val.duration), 0) || 0;
        let callInternalDuration = dataval.filter(elm => elm.status === 'completed')
                                    .filter(elm1 => elm1.filetype === 'callrecording')
                                    .filter(elm2 => elm2.callDirection.toLowerCase() === 'internal')
                                    .reduce((elm, val) => elm + parseInt(val.duration), 0) || 0;

        if (callInternalDuration <= 0 && callOutboundDuration <= 0 && callInboundDuration <= 0) {
            callClm    = [
                            ['No Data',0.01]
                            ];
            colors      = ['#cccccc'];
        }else{
            callClm     = [
                            ['inbound', callInboundDuration],
                            ['outbound', callOutboundDuration],
                            ['internal', callInternalDuration]
                        ];
            colors  = ['#5799C7', '#FF9F4B', '#61B861'];
        }
        xaxis      = ['Inbound', 'outbound', 'Neutral'];
        chartObj['crGraph'] = c3.generate({
            bindto: '#crGraph',
            data: {
                columns: callClm,
                type: 'donut',
            },
            axis: {
                x: {
                    show: false,
                },
                y: {
                    label: "minutes",
                }
            },
            tooltip: {
                grouped: false,
                format: {
                    title: function (d) { return ''; },
                    value: function (value, ratio, id) {
                        var formattedTime = (value === 0.01) ? "0 seconds" : formatSeconds(value);
                        return formattedTime;
                    }
                }
            },
            oninit: function() {
                d3.select('#crGraph').selectAll('.c3-target-inbound').on('click', function(event, d) {
                    handleBarClick(event,d,'inbound','callrecording');
                });
                d3.select('#crGraph').selectAll('.c3-target-outbound').on('click', function(event, d) {
                    handleBarClick(event,d,'outbound','callrecording');
                });
                d3.select('#crGraph').selectAll('.c3-target-internal').on('click', function(event, d) {
                    handleBarClick(event,d,'internal','callrecording');
                });
            },
            donut: {
                title: _("Call recording usage")
            },
            color:{
                pattern:colors
            }
        });
      }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });
}

function openmodal(element) {
    const id = element.getAttribute('data-id');
    const buttontype = element.getAttribute('data-buttontype');
    const type = element.getAttribute('data-type');
    const result = getTranscriptionDataForModels(id, buttontype, type);
    if (result.status && result.parsedTranscription) {
        $("#modalcontext").html(`<div>${result.parsedTranscription} <br/></div>`);
    } else {
        $("#modalcontext").html(`<div>${noDataText} <br/></div>`);
    }
    $('#transcriptionmodal').modal('toggle');
}

function audioTranscriptionFormatter(value, row, index) {
    //If voicemail is deleted than greyOut all action buttons.
    const isVoicemailDeleted = row.voicemailDeleted == '1' ? true : false;
    let isDisabled = tooltip = '';
    if (isVoicemailDeleted) {
        tooltip = _('Voicemail Deleted');
        isDisabled = 'disabled-button';
    }
    const html = ` <div class="actionscribeicons">
                        <a class="transcriptrow cursor-pointer  ${isDisabled}" data-id="${row.id}" data-buttontype='transcriptionmodal'  title="${isVoicemailDeleted ? tooltip : _('Open Transcript')}" ${isVoicemailDeleted ? "" : `onclick="openmodal(this)"`} id="${value}">
                        <img src="../admin/assets/scribe/images/scribe-doc.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                        <a class="transcriptrow cursor-pointer  ${isDisabled}" data-id="${row.id}" data-buttontype='playbackmodel' title="${isVoicemailDeleted ? tooltip : _('Scribe Playback Transcription')}" ${isVoicemailDeleted ? "" : `onclick="playbackModel(this)"`}>
                            <img src="../admin/assets/scribe/images/scribe-play.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                        <a class="transcriptrow cursor-pointer  ${isDisabled}" data-id="${row.id}" data-buttontype='playbackmodel' title="${isVoicemailDeleted ? tooltip : _('Download Recording')}" ${isVoicemailDeleted ? "" : `onclick="downloadAudio('${row.filepath}', '${row.uniqueid}')"`}>
                            <img src="../admin/assets/scribe/images/download.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                    </div>`;
    return html;
}

function uploadAudioTranscriptionFormatter(value, row, index) {
    const isCompleted = row.status === 'completed' && row.transcriptionPath;
    let isDisabled = tooltip = '';
    let isCompleted_play = isCompleted;
    if (!isCompleted) {
        tooltip = _('Transcription not completed');
        isDisabled = 'disabled-button';
    }
    let isDisabled_play = isDisabled;
    if (row.delete_after_transcription == '1') {
        isDisabled_play = 'disabled-button';
        isCompleted_play =0;
    }
    const html = ` <div class="actionscribeicons">
                        <a class="transcriptrow cursor-pointer ${isDisabled}" data-id="${row.id}" data-type='upload' data-buttontype='uploadmodal' title="${isCompleted ? _('Open Transcript') : tooltip}" ${isCompleted ? `onclick="openmodal(this)"` : ""}>
                        <img src="../admin/assets/scribe/images/scribe-doc.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                        <a class="transcriptrow cursor-pointer ${isDisabled_play}" data-id="${row.id}" data-buttontype='playbackmodel' data-type='upload' title="${isCompleted_play ? _('Scribe Playback Transcription') : tooltip}" ${isCompleted_play ? `onclick="playbackModel(this)"` : ""}>
                            <img src="../admin/assets/scribe/images/scribe-play.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                        <a class="transcriptrow cursor-pointer ${isDisabled_play}" data-upload-id="${row.id}" title="${isCompleted_play ? _('Download Recording') : tooltip}" ${isCompleted_play ? `onclick="downloadUploadTranscription('${row.file_path}')"` : ""}>
                            <img src="../admin/assets/scribe/images/download.png" width="20px" height="20px" alt="PBX Scribe" />
                        </a>
                    </div>`;
    return html;
}

function downloadAudio(fileName, uniqueid){
    fileName = encodeURIComponent(fileName);
    window.open(`ajax.php?module=${moduleName}&command=callrecordingdownload&file=${fileName}&uniqueid=${uniqueid}`);
}

// Upload functionality
function openUploadModal() {
    $('#uploadModal').modal('show');
    $('#uploadForm')[0].reset();
    $('#uploadProgress').hide();
    $('#uploadResult').hide();
}

function downloadUploadTranscription(filePath) {
    window.open(`/admin/ajax.php?module=scribe&command=downloadUploadTranscription&filePath=${filePath}`);
}

function getUploadStatusClass(status) {
    switch(status) {
        case 'completed': return 'success';
        case 'failed': return 'danger';
        case 'transcribing': 
        case 'processing': return 'warning';
        case 'uploading': return 'info';
        default: return 'default';
    }
}

function getSentimentClass(sentiment) {
    switch(sentiment) {
        case 'positive': return 'success';
        case 'negative': return 'danger';
        case 'neutral': return 'default';
        default: return 'default';
    }
}

function loadUploadedFiles(datetime = '') {
    let url = '/admin/ajax.php?module=scribe&command=getUploadedFiles';
    if (datetime && datetime.includes(' - ')) {
        const dates = datetime.split(' - ');
        const start_date = dates[0].trim();
        const end_date = dates[1].trim();
        url += `&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
    }
    $.get(url)
        .done(function(response) {
            if (response.status && response.files) {
                $('#table-uploadedFiles').bootstrapTable('load', response.files);
                
                // Apply sentiment styling to uploaded files table
                var $uploadTable = $('#table-uploadedFiles');
                applyUploadFilesStyling($uploadTable);
                $uploadTable.on('post-body.bs.table', function() {
                    applyUploadFilesStyling($uploadTable);
                });
                $uploadTable.on('refresh.bs.table', function() {
                    applyUploadFilesStyling($uploadTable);
                });
                $uploadTable.on('column-switch.bs.table', function() {
                    applyUploadFilesStyling($uploadTable);
                });
                
                removeLoader();
            } else {
                console.error('Failed to load uploaded files:', response.message);
                removeLoader();
            }
        })
        .fail(function() {
            console.error('Failed to load uploaded files');
            removeLoader();
        });
}

// Upload form handling
$(document).ready(function() {
    // Handle tab clicks
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr("href");
        if (target === '#uploadedFiles') {
            loadUploadedFiles();
        }
    });

    // Upload button click
    $('#uploadBtn').click(function() {
        const form = $('#uploadForm')[0];
        const formData = new FormData(form);
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Show progress
        $('#uploadProgress').show();
        $('#uploadBtn').prop('disabled', true);
        
        $.ajax({
            url: '/admin/ajax.php?module=scribe&command=uploadAudio',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        const percentComplete = (evt.loaded / evt.total) * 100;
                        $('.progress-bar').css('width', percentComplete + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                $('#uploadProgress').hide();
                $('#uploadBtn').prop('disabled', false);
                
                if (response.status) {
                    $('#uploadResult').html('<div class="alert alert-success">' + response.message + '</div>').show();
                    // Reload uploaded files if on that tab
                    if ($('#uploadedFiles').hasClass('active')) {
                        setTimeout(function() {
                            loadUploadedFiles();
                            $('#uploadModal').modal('hide');
                        }, 2000);
                    }
                } else {
                    $('#uploadResult').html('<div class="alert alert-danger">' + (response.message || 'Upload failed') + '</div>').show();
                }
            },
            error: function() {
                $('#uploadProgress').hide();
                $('#uploadBtn').prop('disabled', false);
                $('#uploadResult').html('<div class="alert alert-danger">Upload failed. Please try again.</div>').show();
            }
        });
    });
    
    // Reset modal when closed
    $('#uploadModal').on('hidden.bs.modal', function () {
        $('#uploadAudioForm')[0].reset();
        $('#uploadProgress').hide();
        $('#uploadResult').hide();
        $('#uploadBtn').prop('disabled', false);
    });
});

function voicemailTranscriptionFormatter(row) {
    return '<a href="#">View</a>';
}

function viewCostPredictor() {
    $.get("/admin/ajax.php?module="+moduleName+"&command=getUsageDetailsHtml").done(function (response) {
        if (response.status) {
            $('#usageModal .modal-context').html(response.message);
            $('#usageModal').modal('show');
            let vmmins = $('div[data-voicemail]').attr('data-voicemail');
            let callmins = $('div[data-callrecording]').attr('data-callrecording');
            vmmins = vmmins.replaceAll(",", ".");
            callmins = callmins.replaceAll(",", ".");
            if(callmins <= 0 && vmmins <= 0){
                costPreColumns   = [
                                    ['No Data',0.01]
                                   ];
                costPreColor     = ['#cccccc'];
            }else{
                costPreColumns =  [
                                        ["Voicemail", vmmins],
                                        ["Call Recording", callmins],
                                  ];
                costPreColor   = ['#099F24', '#244C91'];
            }

            setTimeout(() => {
                c3.generate({
                    bindto: '#previousMedia',
                    size: {
                        height: 300,
                        width: 410
                    },
                    data: {
                        columns: costPreColumns,
                        type: 'donut',
                    },
                    tooltip: {
                        format: {
                            value: function (value, ratio, id) {
                                var formattedTime = (value === 0.01) ? "0 seconds" : formatSeconds(value * 60);
                                return formattedTime;
                            }
                        }
                    },
                    donut: {
                        title: _("Previous Media Usage")
                    },
                    colors: {
                        pattern:costPreColor
                    }
                });
            }, 300);
        } else {
            fpbxToast(_(response.message), _('Error'), 'error');
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });
}

function openUploadModal() {
    $('#uploadModal').modal('show');
    // Reset form when opening
    $('#uploadAudioForm')[0].reset();
    $('#uploadModalProgress').hide();
    $('#uploadModalStatus').html('');
    $('#uploadModalBtn').prop('disabled', false).html('<i class="fa fa-upload"></i> ' + _('Upload and Transcribe'));
}

function submitUploadForm() {
    if (!validateUploadForm()) return;
    
    var formData = new FormData();
    var file = document.getElementById('uploadAudioFile').files[0];
    
    formData.append('audioFile', file);
    formData.append('uploadName', $('#uploadName').val());
    formData.append('language', $('#uploadLanguage').val());
    formData.append('deleteAfterTranscription', $('input[name="deleteAfterTranscription"]:checked').val());
    formData.append('module', 'scribe');
    formData.append('command', 'uploadAudioFile');
    
    // Show progress bar
    $('#uploadModalProgress').show();
    $('#uploadModalBtn').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> ' + _('Uploading...'));
    
    $.ajax({
        url: '/admin/ajax.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total * 100;
                    $('#uploadModalProgress .progress-bar').css('width', percentComplete + '%').text(Math.round(percentComplete) + '%');
                }
            }, false);
            return xhr;
        },
        success: function(response) {
            if (response.status) {
                fpbxToast(_('File uploaded successfully! Transcription started.'), _('Success'), 'success');
                $('#uploadModalStatus').html('<div class="alert alert-success">' + 
                    _('Upload successful! Your file is being transcribed. You can check the status in the uploaded files section.') + 
                    '</div>');
                
                // Reset form
                $('#uploadAudioForm')[0].reset();
                
                // Close modal after short delay
                setTimeout(function() {
                    $('#uploadModal').modal('hide');
                    loadUploadedFiles();
                }, 2000);
            } else {
                fpbxToast(_(response.message), _('Error'), 'error');
                $('#uploadModalStatus').html('<div class="alert alert-danger">' + response.message + '</div>');
            }
        },
        error: function(xhr, status, error) {
            fpbxToast(_('Upload failed: ') + error, _('Error'), 'error');
            $('#uploadModalStatus').html('<div class="alert alert-danger">' + _('Upload failed. Please try again.') + '</div>');
        },
        complete: function() {
            $('#uploadModalProgress').hide();
            $('#uploadModalBtn').prop('disabled', false).html('<i class="fa fa-upload"></i> ' + _('Upload and Transcribe'));
        }
    });
}

function validateUploadForm() {
    var file = document.getElementById('uploadAudioFile').files[0];
    if ($('#uploadName').val().trim() == "") {
        fpbxToast(_('Please enter a descriptive name to identify this upload'), _('Error'), 'error');
        $('#uploadName').val('').focus();
        return false;
    }
    if (!file) {
        fpbxToast(_('Please select an audio file'), _('Error'), 'error');
        return false;
    }
    
    var supportedFormats = ['wav', 'mp3', 'mp4', 'm4a', 'flac', 'webm', 'ogg'];
    var fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
        fpbxToast(_('Unsupported file format. Please select a supported audio file.'), _('Error'), 'error');
        $('#uploadAudioFile').val('');
        return false;
    }
    
    // Use actual server limit if available, otherwise default
    var maxSize = $('#maxSizeBytes').val() || (2 * 1024 * 1024); // Use server limit or 100MB default
    if (file.size > maxSize) {
        var maxSizeFormatted = maxSize >= 1048576 ? 
            (maxSize / 1048576).toFixed(2) + ' MB' : 
            (maxSize / 1024).toFixed(2) + ' KB';
        fpbxToast(_('File size exceeds maximum allowed size of ') + maxSizeFormatted, _('Error'), 'error');
        $('#uploadAudioFile').val('');
        return false;
    }
    
    return true;
}

function updateUsageChart(chartType, graphType) {
    if (graphs[graphType]) {
        graphs[graphType].transform(chartType);
    }
}

$('#transcriptUsersTable').on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table load-success.bs.table load-error.bs.table', function () {
    const chosenCount = $('#transcriptUsersTable').bootstrapTable('getSelections').length;
    const enableButtons = ['#enable-users', '#disable-users'];

    enableButtons.forEach(buttonId => {
        $(buttonId).prop('disabled', chosenCount === 0);
    });
});

function formatSeconds(iSec = 0) {
    let output = '';
    const minutes = Math.floor(iSec / 60);
    const seconds = Math.floor(iSec % 60);
    if (minutes > 1) {
        output += minutes + " mins ";
    } else if (minutes === 1) {
        output += minutes + " min ";
    }
    if (seconds > 1) {
        output += seconds + " seconds";
    } else if (seconds === 1) {
        output += seconds + " second";
    }
    return output.trim();
}

function playbackModel(element) {
    const id = element.getAttribute('data-id');
    const buttontype = element.getAttribute('data-buttontype');
    const type = element.getAttribute('data-type');
    const result = getTranscriptionDataForModels(id, buttontype, type);
    if (result.status && result.transcription) {
        $('#playbackTranscriptionModal').modal('toggle');
        $("#playbackModalContext").html('');
        $('#scribeTagsList').empty();
        let res = $('#scribeTagsList li.higlightTag').removeClass('higlightTag');
        scribeTagsIncludes = [];
        const transcriptionChat = result.transcription;
        const duration = result.duration;
        //Add Transcription PlayBack
        createTranscriptPlayback(id, transcriptionChat, duration);
        initializePlayback(id, transcriptionChat);
        //Add Transcription
        const chatContainer = addTranscriptionToChat(transcriptionChat,result);
        $("#playbackModalContext").append(chatContainer);
        setTimeout(() => {
            runPlaybackTranscriptPlayer(id,type);
        }, 100);
        //chat thread
        setupChatThreadClick(id);
        setupScrollHandler();
    } else {
        $("#modalcontext").html(`<div>${noDataText} <br/></div>`);
        $('#transcriptionmodal').modal('toggle');
    }
}

function createTranscriptPlayback(id, transcriptionChat, duration) {
    const jpContainerTranscript = document.createElement('div');
    jpContainerTranscript.id = 'jp_container_' + id;
    jpContainerTranscript.setAttribute('data-player', 'jquery_jplayer_' + id);
    jpContainerTranscript.classList.add('jp-audio-freepbx');
    jpContainerTranscript.setAttribute('role', 'application');
    jpContainerTranscript.setAttribute('aria-label', 'media player');

    // Create jp-type-single div
    const jpTypeSingle = document.createElement('div');
    jpTypeSingle.classList.add('jp-type-single');

    // Create jp-gui jp-interface div
    const jpGuiInterface = document.createElement('div');
    jpGuiInterface.classList.add('jp-gui', 'jp-interface');

    // Create jp-controls div
    const jpControls = document.createElement('div');
    jpControls.classList.add('jp-controls');

    // Create play button
    const playButton = document.createElement('i');
    playButton.classList.add('fa', 'fa-play', 'jp-play');

    // Create restart button
    const restartButton = document.createElement('i');
    restartButton.classList.add('fa', 'fa-undo', 'jp-restart');

    // Append buttons to jp-controls
    jpControls.appendChild(playButton);
    jpControls.appendChild(restartButton);

    // Create jp-progress div
    const jpProgress = document.createElement('div');
    jpProgress.classList.add('jp-progress');

    // Create jp-seek-bar div
    const jpSeekBar = document.createElement('div');
    jpSeekBar.classList.add('jp-seek-bar', 'progress');

    // Create jp-current-time div
    const jpCurrentTime = document.createElement('div');
    jpCurrentTime.classList.add('jp-current-time');
    jpCurrentTime.setAttribute('role', 'timer');
    jpCurrentTime.setAttribute('aria-label', 'time');
    jpCurrentTime.innerHTML = '&nbsp;';

    // Create progress-bar div
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar', 'progress-bar-striped', 'active');
    progressBar.style.width = '100%';

    // Create jp-play-bar div
    const jpPlayBar = document.createElement('div');
    jpPlayBar.classList.add('jp-play-bar', 'progress-bar');

    // Create jp-play-bar inner div
    const jpPlayBarInner = document.createElement('div');
    jpPlayBarInner.classList.add('jp-play-bar');

    // Create jp-ball div
    const jpBall = document.createElement('div');
    jpBall.classList.add('jp-ball');
    jpPlayBarInner.appendChild(jpBall);
    jpPlayBar.appendChild(jpPlayBarInner);

    // Create jp-duration div
    const jpDuration = document.createElement('div');
    jpDuration.classList.add('jp-duration');
    jpDuration.setAttribute('role', 'timer');
    jpDuration.setAttribute('aria-label', 'duration');
    jpDuration.innerHTML = '&nbsp;';

    jpSeekBar.appendChild(jpCurrentTime);
    jpSeekBar.appendChild(progressBar);
    jpSeekBar.appendChild(jpPlayBar);
    jpSeekBar.appendChild(jpDuration);

    // Append jp-seek-bar to jp-progress
    jpProgress.appendChild(jpSeekBar);

    // Create jp-volume-controls div
    const jpVolumeControls = document.createElement('div');
    jpVolumeControls.classList.add('jp-volume-controls');

    // Create mute button
    const muteButton = document.createElement('i');
    muteButton.classList.add('fa', 'fa-volume-up', 'jp-mute');

    // Create unmute button
    const unmuteButton = document.createElement('i');
    unmuteButton.classList.add('fa', 'fa-volume-off', 'jp-unmute');

    jpVolumeControls.appendChild(muteButton);
    jpVolumeControls.appendChild(unmuteButton);
    jpGuiInterface.appendChild(jpControls);
    jpGuiInterface.appendChild(jpProgress);
    jpGuiInterface.appendChild(jpVolumeControls);
    jpTypeSingle.appendChild(jpGuiInterface);
    jpContainerTranscript.appendChild(jpTypeSingle);

    //Append with PlayBack Model
    document.getElementById('playbackModalContext').appendChild(jpContainerTranscript);
    const jpPlayer = document.createElement('div');
    jpPlayer.id = 'jquery_jplayer_' + id;
    jpPlayer.classList.add('jp-jplayer');
    jpContainerTranscript.appendChild(jpPlayer);
    modifyPlaybar(transcriptionChat, duration);
}



function initializePlayback(id,transcriptionChat) {
    var priviousTime =0;
    $("#jquery_jplayer_" + id).jPlayer({
        ready: function () {
            var $this = this;
            $("#jp_container_" + id + " .jp-restart").click(function () {
                if ($($this).data("jPlayer").status.paused) {
                    $($this).jPlayer("pause", 0);
                } else {
                    $($this).jPlayer("play", 0);
                    var allDivs = $(".chat-thread");
                    allDivs.slice(0, 3).css("display", "block");
                }
            });
        },
        timeupdate: function (event) {
            $("#jp_container_" + id).find(".jp-ball").css("left", event.jPlayer.status.currentPercentAbsolute + "%");
            event.prevent
            // displayOrHide(event);
            highlightCurrentSentence(event.jPlayer.status.currentTime,event.jPlayer.status.currentPercentAbsolute);
            priviousTime=event.jPlayer.status.currentTime;
        },
        ended: function (event) {
            $("#jp_container_" + id).find(".jp-ball").css("left", "0%");
        },
        swfPath: "/js",
        supplied: supportedHTML5,
        cssSelectorAncestor: "#jp_container_" + id,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true
    });
}

function displayOrHide(event){
    $('.chat-thread').css('display','none');
}
scribeTagsIncludes = [];
function addTranscriptionToChat(transcriptionChat,data) {
    let callTo = callFrom = '';
    if(data.hasOwnProperty('callToExt') && data.hasOwnProperty('callerID')) {
        callTo = data['callToExt'];
        callerID = data['callerID'];
    }
    let parseType = data['parseType'];
    let fileType = data['fileType'];
    const chatContainer = $('<div id="chatContainer" class=""></div>');
    const openShow = $('<div id="openShow"></div>');
    const chatView = $('<i class="fa fa-expand cursor-pointer playbackview" title="Expand Conversation" id="eyeShow"></i>');
    chatView.css('display','block');
    chatView.on('click', function() {
        viewChat("eyeShow");
    });
    const chatView2 = $('<i class="fa fa-compress cursor-pointer playbackview" title="Minimize Conversation" id="eyeHide"></i>');
    chatView2.on('click', function() {
        viewChat("eyeHide");
    });
    chatView2.css('display','none');
    openShow.append(chatView);
    openShow.append(chatView2);
    chatContainer.append(openShow);
        const speakerContanier = $('<div id="speakerContanier"></div>');
        let speakericon1= $('<i class="fa fa-caret-down speakericon closeIcon1" id="speakericon1" onclick="showSpeaker(\'speakericon1\',\'closeIcon1\')"></i>');
        let openIcon= $('<i class="fa fa-caret-up speakericon openicon1" id="speakericon1" style="display:none" onclick="showSpeaker(\'speakericon1\',\'openicon1\')"></i>');
        let speakericon2= $('<i class="fa fa-caret-down speakericon closeIcon2" id="speakericon2" onclick="showSpeaker(\'speakericon2\',\'closeIcon2\')"></i>');
        let openIcon1= $('<i class="fa fa-caret-up speakericon openicon2" id="speakericon2" style="display:none" onclick="showSpeaker(\'speakericon2\',\'openicon2\')"></i>');
        const speakerinnerContanier = $('<div id="speakerinnerContanier" style="position: relative;"></div>');
        const speaker0 = $('<span id="speakerdiv0" class="tool-tip" style="display:none;position: absolute; top: 27px; left: 0; background-color: #333; color: white; padding: 5px; border-radius: 4px"></span>');
        const speaker1 = $('<span id="speakerdiv1" class="tool-tip" style="display:none;position: absolute; top: 27px; right: 3px; background-color: #333; color: white; padding: 5px; border-radius: 4px;"></span>');
        speakerinnerContanier.append(speakericon1);
        speakerinnerContanier.append(openIcon);
        speakerinnerContanier.append(speaker0);
        speakerinnerContanier.append(speakericon2);
        speakerinnerContanier.append(openIcon1);
        speakerinnerContanier.append(speaker1);
        speakerContanier.append(speakerinnerContanier);
        chatContainer.append(speakerContanier);

    const chatContent = $('<div id="chatContent"></div>');
    if (transcriptionChat.length === 0) {
        const noTranscriptionMessage = $("<div class='no-transcription-message'>" + _('No transcription chat is available for this audio.') + "</div>");
        chatContent.append(noTranscriptionMessage);
        chatContainer.css({
            'width': '100%',
            'height': 'auto'
        });
    } else {
        if(parseType !='multichannel'){
            speakerContanier.css('display','none');
        }
        if(parseType =='multichannel') {
            speaker0.text(callerID);
            speaker1.text(callTo);
        }
        transcriptionChat.forEach(entry => {
            const speakerOrChannel = entry.channel !== undefined ? entry.channel : entry.speaker;
            const speakerClass = (speakerOrChannel % 2 === 0) ? 'speaker-even' : 'speaker-odd';
            entry.sentences.forEach((sentence,index) => {
                const sentenceElement = `<div class="chat-thread ${speakerClass}" data-start="${sentence.start}" data-end="${sentence.end}"   data-sentiment="${sentence.sentiment}" style="display:block" >${sentence.text}</div>`;
                chatContent.append(sentenceElement);
            });
            return;
        });
    }
    chatContainer.append(chatContent);

    return chatContainer;
}

function runPlaybackTranscriptPlayer(id,type) {
    $(`#jp_container_${id}`).addClass("jp-state-loading");
    $.ajax({
        type: 'POST',
        url: "ajax.php",
        data: { module: moduleName, command: "gethtml5", id: id, type: type },
        dataType: 'json',
        timeout: 30000
    })
        .done(function (data) {
            var player = $(`#jquery_jplayer_${id}`);
            if (data.status) {
                player.on($.jPlayer.event.error, function (event) {
                    $(`#jp_container_${id}`).removeClass("jp-state-loading");
                    fpbxToast(_('Playback error'), _('Error'), 'error');
                });
                player.one($.jPlayer.event.canplay, function (event) {
                    player.jPlayer("play");
                    $(`#jp_container_${id}`).removeClass("jp-state-loading");
                });
                player.on($.jPlayer.event.play, function (event) {
                    player.jPlayer("pauseOthers", 0);
                });
                player.jPlayer("setMedia", data.files);
            } else {
                const errorMessage = data.message ? data.message : 'Failed to retrieve media';
                fpbxToast(_(errorMessage), _('Error'), 'error');
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $(`#jp_container_${id}`).removeClass("jp-state-loading");
            fpbxToast(_('AJAX request failed: ') + errorThrown, _('Error'), 'error');
        });

    //Stop playback when the modal is closed
    $('#playbackTranscriptionModal').on('hidden.bs.modal', function () {
        $(`#jquery_jplayer_${id}`).jPlayer("destroy");
    });
}

function showSpeaker(id,icon){
  if(id =='speakericon1'){
    $('#speakerdiv0').toggle();
    if(icon=='openicon1'){
        $('.openicon1').css('display','none');
        $('.closeIcon1').css('display','block');
    }else if(icon=='closeIcon1'){
        $('.openicon1').css('display','block');
        $('.closeIcon1').css('display','none');
    }
  }
  if(id =='speakericon2'){
    $('#speakerdiv1').toggle();
    if(icon=='openicon2'){
        $('.openicon2').css('display','none');
        $('.closeIcon2').css('display','block');
    }else if(icon=='closeIcon2'){
        $('.openicon2').css('display','block');
        $('.closeIcon2').css('display','none');
    }
  }
}

function setupChatThreadClick(id) {
    $(document).off('click', '.chat-thread').on('click', '.chat-thread', function () {
        const start = parseFloat($(this).data('start'));
        $(`#jquery_jplayer_${id}`).jPlayer("play", start);
    });
}

function highlightCurrentSentence(currentTime,currentAbsoulatePer) {
    let highlighted = false;
    $('.chat-thread').each(function (i,element) {
        const start = parseFloat($(this).data('start'));
        const end = parseFloat($(this).data('end'));
        const sentiment = $(this).data('sentiment');
        let higlightTag = '';
        if (currentTime >= start && currentTime <= end) {
            let res = $('#scribeTagsList li.higlightTag').removeClass('higlightTag');
            let textHas = $(this).text();
            const result = scribeTagsIncludes.some(word => textHas.toLowerCase().includes(word.toLowerCase()));
            $(this).show().addClass('highlight').addClass(sentiment);
           scribeTagsIncludes.some(function(word,index){
                  let result =   textHas.toLowerCase().includes(word.toLowerCase())
                  if(result){
                    $(`#${word}`).addClass('higlightTag')
                    higlightTag = word;
                  }
            })
            highlighted = true;
        }
        else {
            $(this).removeClass('highlight');
            $(this).removeClass(sentiment);
        }
    });
    if (highlighted && !isUserScrolling) {
        scrollToHighlighted();
    }
}

function modifyPlaybar(chat, totalDuration) {
    for(let key in chat) {
        if(chat[key]['sentences']) {
            let chatVal = chat[key]['sentences'];
            for(let key2 in chatVal) {
                let start = chatVal[key2]['start'];
                let end   = chatVal[key2]['end'];
                let sentiment= chatVal[key2]['sentiment'];
                let startWidth = (start/totalDuration)*100;
                let endWidth = (end/totalDuration)*100;
                let totalwidth = endWidth-startWidth;
                let leftPos=startWidth.toFixed(1);
                let widthPos=totalwidth.toFixed(1);
                var highlight;
                if(sentiment == 'negative') {
                    highlight = $('<div class="overly"></div>').css({'background-color': sentimentAssets.negative[0],'left': leftPos + '%','width': widthPos+ '%'});
                }
                if(sentiment == 'positive') {
                    highlight = $('<div class="overly"></div>').css({'background-color': sentimentAssets.positive[0], 'left': leftPos + '%', 'width': widthPos+ '%'});
                }
                if(sentiment == 'neutral') {
                    highlight = $('<div class="overly"></div>').css({'background-color': sentimentAssets.neutral[0], 'left': leftPos + '%', 'width': widthPos+ '%'});
                }
                $('.jp-play-bar').append(highlight);
            }
        }
    }
}

function scrollToHighlighted() {
    const highlighted = $('.chat-thread.highlight');
    if (highlighted.length) {
        const container = $('#chatContainer');
        const containerTop = container.offset().top;
        const containerHeight = container.height();
        const highlightedTop = highlighted.offset().top;
        const highlightedHeight = highlighted.outerHeight();
        const scrollTop = highlightedTop - containerTop + container.scrollTop() - (containerHeight / 2) + (highlightedHeight / 2);
        container.animate({scrollTop: scrollTop}, 300);
    }
}

function setupScrollHandler() {
    const container = $('#chatContainer');
    container.on('scroll', function () {
        isUserScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
            scrollToHighlighted();
        }, 1000);
    });
}

function setGraphLoader(show = false) {
    if (show) {
        $('.graph-loader').show();
    } else {
        $('.graph-loader').hide();
    }
}

function setdaterange() {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    let page = getQueryParams('display');
    let st = localStorage.getItem('startdate')
    let end = localStorage.getItem('enddate')
    var stdate ='';var endate ='';
    if (page == moduleName) {
        setLoader(true);
        /** INITIALISE DATE RANGE PICKER */
        let startDate = moment().subtract(30, 'days').startOf('day');
        let endDate = moment().endOf('day');
        let datetime = getQueryParams('datetime');
        if (datetime && datetime.split(' - ').length > 0) {
            datetime = decodeURIComponent(datetime);
            startDate = datetime.split(' - ')[0];
            endDate = datetime.split(' - ')[1];
        }
        if((st != 'null')){
            stdate = st;
        }else{
            stdate = startDate;
        }
        if(( end != 'null' ) ){
            endate = end;
        }else{
            endate = endDate;
        }
        $('input[name="datetime"]').daterangepicker({
            timePicker: true,
            maxSpan: {
                year: 1
            },
            startDate: stdate,
            endDate:  endate,
            timePickerSeconds: true,
            locale: {
                format: 'YYYY-MM-DD HH:mm:ss'
            },
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                'Last 30 Days': [moment().subtract(30, 'days').startOf('day'), moment().endOf('day')],
                'This Month': [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')],
                'Last Month': [moment().subtract(1, 'month').startOf('day'), moment().endOf('day')],
                'Last 3 Months': [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')]
            }
        });
    }
};


function setLoader(show = false) {
    if (!show) {
        $('.loader').hide();
        $('#cdrTable').show();
        $('#tableHeading').show();
        $('#toolbar-cdr').show();
        $('.cdr_summary_wrapper').show();
    } else {
        $('.loader').show();
        $('#cdrTable').hide();
        $('#tableHeading').hide();
        $('#toolbar-cdr').hide();
        $('.cdr_summary_wrapper').hide();
    }
}

function hideAllDropDownExcept(type = "") {
    let typeToWrapperMap = { 'extension': '.extension_list_wrapper', 'did': '.did_list_wrapper', 'ring_group': '.ring_group_list_wrapper', 'queue': '.queue_list_wrapper' };
    for (let key in typeToWrapperMap) {
        if (key == type) {
            $('.filter_container ' + typeToWrapperMap[key]).show();
        } else {
            $('.filter_container ' + typeToWrapperMap[key]).hide();
        }
    }
}

var pageval = 'graph';var toggleView = true;
document.addEventListener("DOMContentLoaded", function () {
    let redirctval  = localStorage.getItem('hasRedirected');
    let reportval   = localStorage.getItem('redirectreportType');
    let record      = localStorage.getItem('recordingtype');
    let previousMonth;let today;let reportType;let recordType;
    let st      = localStorage.getItem('startdate');
    let end     = localStorage.getItem('enddate');
    let filterStDate;let filterenDate;
    if(redirctval){
        filterStDate = st;
        filterenDate = end;
    }else{
        let d1            = filterStDate +' - '+ filterenDate;
        today         = new Date().toISOString().split('T')[0];
        previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let dateval1      = previousMonth+' 00:00:00' +' - ' + today+' 23:59:59';
        var dateval       =  $('#filter_date_time').val(dateval1);
        today             = today + ' 23:59:59';
        previousMonth     = previousMonth +' 00:00:00';
        let filterVal = filterTypes();
        let filterSt  = filterVal['start_date'];
        let filterEnd = filterVal['end_date'];
        reportType    =filterVal['reportType'];
        recordType    =filterVal['recordType'];
        localStorage.setItem('startdate',filterSt);
        localStorage.setItem('enddate',filterEnd);
        filterStDate = filterVal['start_date'];
        filterenDate = filterVal['end_date'];

    }
    setdaterange();
    localStorage.removeItem('startdate');
    localStorage.removeItem('enddate');
   if(redirctval) {
        this.pageval = 'list';
        document.getElementById('data').classList.remove('hidden');
        document.getElementById('graphdata').classList.add('hidden');
        $('#downloadtrans').prop('disabled', true);
        $('#downloadtrans').css('opacity',0.4);
        $('#sendemail').prop('disabled', true);
        $('#sendemail').css('opacity',0.4);

        if(record == 'voicemail'){
            reportval1 = reportval + ' voicemail';
        }else{
            reportval1 =reportval;
        }
        let reportType = $('select[name="reportType"]').val(reportval1);
        document.getElementById('switchbtngraph').style.setProperty('background', '#ffffff', 'important');
        document.getElementById('switchbtndata').style.setProperty('background', '#d6e4dd', 'important');
        getvoiceTranscripts(filterStDate, filterenDate, reportval, record, 1, redirctval);
        localStorage.removeItem('hasRedirected');
        localStorage.removeItem('redirectreportType');
        localStorage.removeItem('recordingtype');
    }else{
        this.pageval = 'graph';
        document.getElementById('switchbtngraph').style.setProperty('background', '#d6e4dd', 'important');
        document.getElementById('switchbtndata').style.setProperty('background', '#ffffff', 'important');
        getvoiceTranscripts(previousMonth, today, reportType, recordType);
    }
    localStorage.clear();
});

function sortDate(a, b) {
    return (new Date(a).getTime() - new Date(b).getTime());
}
function getvoiceTranscripts(start_date = '', end_date = '', reportType = '', recordtype='', dashboard=0, redirctval=null) {
    showLoader();
    fetch(`ajax.php?module=${moduleName}&command=getTranscripts&start_date=${start_date}&end_date=${end_date}&reportype=${reportType}&recordingtype=${recordtype}&dashboard=${dashboard}`).then(response => response.json())
        .then(data => {
            if (data.error) {
                removeSpin();
                removeLoader();
                return;
            }
            populateScribeTranscriptionList(data, reportType, recordtype, redirctval);
            removeLoader();
        }).catch(error => fpbxToast(error, _('Error'), 'error'));
}

function showLoader() {
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.loader').style.display = 'block';
}

function removeLoader() {
    setTimeout(() => {
        document.querySelector('.overlay').style.display = 'none';
        document.querySelector('.loader').style.display = 'none';
    }, 100);
}

function populateScribeTranscriptionList(data, reportType, recordtype, redirctval=null) {
    const STATUS_INITIATED      = "initiated";
    const STATUS_COMPLETED      = "completed";
    const STATUS_FAILED         = "failed";
    const STATUS_LIMIT_REACHED  = "limit_reached";
    const STATUS_PROCESSING     = 'processing';
    const dataVal               = data['data'];
    let countCallDirct          = data['countCallDirct'];
    let countSentiments         = data['sentiments']
    let basedOnSentiment        = data['basedOnSentiment'];
    if(dataVal.length <=0){
        //fpbxToast(_('No Data Found'), _('Success'), 'success');
    }
    const completedTrancription = dataVal.filter(item => item.status === STATUS_COMPLETED);
    const pendingTrancription   = dataVal.filter(item => item.status === STATUS_INITIATED || item.status === STATUS_FAILED || item.status === STATUS_LIMIT_REACHED || item.status === STATUS_PROCESSING);
    $('#table-scribeTranscripts').bootstrapTable('load', completedTrancription);
    $('#table-scribePendingTranscripts').bootstrapTable('load', pendingTrancription);
    var $table = $('#table-scribeTranscripts');
    $table.bootstrapTable('hideColumn', 'user');
    $('#table-scribeTranscripts').bootstrapTable('refreshOptions',{
       pagination: true,search: true, showColumns: true,resetSearch:true
   })
   applyConditionalStyling($table);
   $table.on('post-body.bs.table', function() {
      applyConditionalStyling($table);
   });
   $table.on('refresh.bs.table', function() {
      applyConditionalStyling($table);
   });
   $table.on('column-switch.bs.table', function() {
       applyConditionalStyling($table);
   });

   $pendingTable = $('#table-scribePendingTranscripts');
   $pendingTable.bootstrapTable('hideColumn', 'user');
   applyConditionalStyling($pendingTable);
   $pendingTable.on('post-body.bs.table', function() {
       applyConditionalStyling($pendingTable);
   });
   $pendingTable.on('refresh.bs.table', function() {
       applyConditionalStyling($pendingTable);
   });
   $pendingTable.on('column-switch.bs.table', function() {
       applyConditionalStyling($pendingTable);
   });
   //let record = localStorage.getItem('recordingtype');
    if (this.pageval == 'graph' && !redirctval) {
        if (dataVal.length <= 0) {
            $(`#displayerror`).css('display', 'none');
            removeSpin();
            $('#totalCalls').text('0');
            $('#totalCalls').text('0');
            $('#completedCalls').text('0');
            $('#pendingCalls').text('0');
            $('#inboundCalls').text('0');
            $('#outboundCalls').text('0');
            $('#internalCalls').text('0');
            $('#inboundCalls').text('0');
            $('#inbondVoicemail').text('0');
            $('#internalVoicemail').text('0');
            $('#negstm').text('0');
            $('#nutstm').text('0');
            $('#posstm').text('0');
        } else {
            $(`#displayerror`).css('display', 'none');
            removeSpin();
            $('#totalCalls').text(dataVal.length);
            $('#completedCalls').text(completedTrancription.length);
            $('#pendingCalls').text(pendingTrancription.length);
            $('#inboundCalls').text(countCallDirct[0]['InboundCalls']);
            $('#outboundCalls').text(countCallDirct[0]['OutboundCalls']);
            $('#internalCalls').text(countCallDirct[0]['InternalCalls']);
            $('#inbondVoicemail').text(countCallDirct[0]['InboundVoicemail']);
            $('#internalVoicemail').text(countCallDirct[0]['InternalVoicemail']);
            $('#negstm').text(countSentiments[0]['negative']);
            $('#nutstm').text(countSentiments[0]['neutral']);
            $('#posstm').text(countSentiments[0]['positive']);
        }
        if ((reportType == '' || reportType == 'allcalls' )) {
            $('.avgstatus').css('display', 'none');
            $('.totaldata').css('display', 'block');
            $('.internal').css('display', 'block');
            $('.inbound').css('display', 'block');
            $('.outbound').css('display', 'block');
            $('.internalVoice').css('display', 'block');
            $('.inboundVoice').css('display', 'block');
        }
        if(recordtype == 'voicemail'){
            if (reportType == 'inbound') {
                $('.totaldata').css('display', 'none');
                $('.internal').css('display', 'none');
                $('.outbound').css('display', 'none');
                $('.inbound').css('display', 'none');
                $('.avgstatus').css('display', 'block');
                $('.internalVoice').css('display', 'none');
                $('.inboundVoice').css('display', 'block');
            }
            if (reportType == 'internal') {
                $('.totaldata').css('display', 'none');
                $('.inbound').css('display', 'none');
                $('.outbound').css('display', 'none');
                $('.avgstatus').css('display', 'block');
                $('.internal').css('display', 'none');
                $('.internalVoice').css('display', 'block');
                $('.inboundVoice').css('display', 'none');
            }

        }else if(recordtype == 'callrecording'){

            if (reportType == 'outbound') {
                $('.totaldata').css('display', 'none');
                $('.internal').css('display', 'none');
                $('.inbound').css('display', 'none');
                $('.outbound').css('display', 'block');
                $('.avgstatus').css('display', 'block');
                $('.internalVoice').css('display', 'none');
                $('.inboundVoice').css('display', 'none');
            }
            if (reportType == 'inbound') {
                $('.totaldata').css('display', 'none');
                $('.internal').css('display', 'none');
                $('.outbound').css('display', 'none');
                $('.inbound').css('display', 'block');
                $('.avgstatus').css('display', 'block');
                $('.internalVoice').css('display', 'none');
                $('.inboundVoice').css('display', 'none');
            }
            if (reportType == 'internal') {
                $('.totaldata').css('display', 'none');
                $('.inbound').css('display', 'none');
                $('.outbound').css('display', 'none');
                $('.avgstatus').css('display', 'block');
                $('.internal').css('display', 'block');
                $('.internalVoice').css('display', 'none');
                $('.inboundVoicetus').css('display', 'none');
            }
        }
        var stcolors,stxaxis,stcolumns;
        if ( ( (countSentiments[0]['negative'] <=0 && countSentiments[0]['neutral'] <=0  && countSentiments[0]['positive'] <=0))) {
            //graph for over all sentiments
            stxaxis         = ['No Data'];
            stcolumns       = [
                                    ['NO Data', 0.01]
                                ];
            stcolors        = ['#cccccc'];
            if((reportType == '' || reportType == 'allcalls' )){
                $('#overall').removeClass().addClass('col-lg-4');
            }else{
                $('#overall').removeClass().addClass('col-lg-6');
            }
        }else{
            stxaxis         = ['Positive', 'Negative', 'Neutral'];
            stxaxis         =['sentiments'];
            stcolumns       = [
                                    ['Positive', countSentiments[0]['positive']],
                                    ['Negative', countSentiments[0]['negative']],
                                    ['Neutral', countSentiments[0]['neutral']]
                                ];
            stcolors         = [sentimentAssets.positive[0],sentimentAssets.negative[0], sentimentAssets.neutral[0]];
            $('#overall').removeClass().addClass('col-lg-4');
        }

        getGraphData('overallsentiments', stcolumns, 'donut', stxaxis,0,stcolors,'Sentiments');
        if (countCallDirct != null) {
            //graph for total calls
            $('#calls').css('display','block');
            $('#overallvoicemail').css('display','block');
            $('#calls').removeClass().addClass('col-lg-4');
            if(countCallDirct[0]['InboundCalls'] <= 0  && countCallDirct[0]['OutboundCalls'] <= 0 && countCallDirct[0]['InternalCalls'] <= 0)
            {
                xaxis         = ['No Data'];
                var columns   = [
                                    ['NO Data', 0.01]
                                ];
                colors          = ['#cccccc'];
                if((reportType == '' || reportType == 'allcalls' )){
                    $('#calls').removeClass().addClass('col-lg-4');
                }else{
                    $('#calls').removeClass().addClass('col-lg-6');
                }
                if((reportType == 'internal' || reportType == 'inbound' ) && recordtype == 'voicemail'){
                    $('#calls').css('display','none');
                }

                getGraphData('overallcall', columns, 'donut', xaxis,0,colors,"Total Calls");
            }else{
                xaxis         =['calldetail'];
                var columns = [
                                    ['Inbound', countCallDirct[0]['InboundCalls']],
                                    ['Outbound', countCallDirct[0]['OutboundCalls']],
                                    ['Internal', countCallDirct[0]['InternalCalls']]
                                ];
                colors         = ['#5799C7', '#FF9F4B', '#61B861'];
                $('#calls').removeClass().addClass('col-lg-4');
                getGraphData('overallcall', columns, 'donut', xaxis,0,colors,'Total Calls');

            }

            if(countCallDirct[0]['InboundVoicemail'] <= 0 && countCallDirct[0]['InternalVoicemail'] <= 0)
                {
                    xaxis         = ['No Data'];
                    var columns   = [
                                        ['NO Data', 0.01]
                                    ];
                    colors          = ['#cccccc'];
                    if((reportType == '' || reportType == 'allcalls' )){
                        $('#overallvoicemail').css('display','block');
                    }else{
                        $('#overallvoicemail').css('display','none');
                    }
                    getGraphData('voicemail', columns, 'donut', xaxis,0,colors,"Total Voicemail");
                }else{
                    $('#overallvoicemail').css('display','block');
                    xaxis         =['voicemaildetails'];
                    var columns = [
                                        ['Inbound', countCallDirct[0]['InboundVoicemail']],
                                        ['Internal', countCallDirct[0]['InternalVoicemail']]
                                    ];
                    colors         = ['#5799C7','#61B861'];
                    getGraphData('voicemail', columns, 'donut', xaxis,0,colors,'Total Voicemail');
                }
        }
        if ((basedOnSentiment != null && basedOnSentiment != "" ) ) {
            //hide the bar,pai,donet graph options
            //graph for total calls
            const neutralValues     = basedOnSentiment.map(item => item.neutral);
            const negativeValues    = basedOnSentiment.map(item => item.negative);
            const posValues         = basedOnSentiment.map(item => item.positive);
            function formatDate(date) {
                const year          = date.getFullYear();
                const month         = String(date.getMonth() + 1).padStart(2, '0');
                const day           = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            const formattedDates = basedOnSentiment
                                    .flat() // Flatten the array
                                    .map(item => new Date(item.filedate))
                                    .map(formatDate);
            xaxis                 = ['neutralValues', 'OutboundCalls', 'InternalCalls'];
            var columns           = [
                                        ['x', ...formattedDates],
                                        ['Postive', ...posValues],
                                        ['Negative', ...negativeValues],
                                        ['Neutral', ...neutralValues],
                                    ];
            colors         = [sentimentAssets.positive[0],sentimentAssets.negative[0], sentimentAssets.neutral[0]];

            $('#calls').css('display','none');
            $('#overall').removeClass().addClass('col-lg-4');
            $('#detailed').removeClass().addClass('col-lg-8');
            $('#detailed').css('display','block');
            getGraphData('detailsentiments', columns, 'line', xaxis, 1,colors,'Sentiments');
            getGraphData('overallsentiments', stcolumns, 'donut', stxaxis,0,stcolors,'Sentiments');
        } else {
            $('#detailed').css('display','none');
            $('#overall').css('display','block');
            if((reportType == 'internal' || reportType == 'inbound' ) && recordtype == 'voicemail'){
                $('#detailed').css('display','block');
            }
            $('#detailed').removeClass().addClass('col-lg-6');
            xaxis         = ['No Data'];
            var columns   = [
                                ['NO Data', 0.01]
                            ];
            colors          = ['#cccccc'];
            getGraphData('detailsentiments', columns, 'donut', xaxis,0,colors,"Sentiments");
        }
        if((reportType == '' || reportType == 'allcalls' )){
            $('#overallvoicemail').css('display','block');
        }else{
            $('#overallvoicemail').css('display','none');
        }


    }
}

function applyConditionalStyling($table) {
    let indexval = 0;
    headerIndices = {
        'call from': null,
        'call to': null,
        'call direction': null,
        'average sentiment': null,
        'recording type': null,
        'duration': null,
        'date and time': null,
        'status':null,
        'user':null,
        'caller id':null,
        'caller name':null,
        'unique id':null,
        'tagname':null
    };
    $table.find('thead th').each(function(i) {
        let headval = $(this).text().trim().toLowerCase();
        if (headerIndices[headval] !== undefined) {
            headerIndices[headval] = i;
        }
        if (headval == 'average sentiment') {
            return indexval = i;
        }
    });

    $table.find('tbody tr').each(function() {
        var $row = $(this);
        var cells = $row.find('td');

        $(cells[headerIndices['call from']]).attr('data-field', 'callFrom');
        $(cells[headerIndices['call to']]).attr('data-field', 'callTo');
        $(cells[headerIndices['call direction']]).attr('data-field', 'callDirection');
        $(cells[headerIndices['date and time']]).attr('data-field', 'filedate');
        $(cells[headerIndices['duration']]).attr('data-field', 'duration');
        $(cells[headerIndices['recording type']]).attr('data-field', 'filetype');
        $(cells[indexval]).attr('data-field', 'averageSentiment');
        $(cells[headerIndices['status']]).attr('data-field', 'status');
        $(cells[headerIndices['user']]).attr('data-field', 'user');
        $(cells[headerIndices['caller id']]).attr('data-field', 'cnum');
        $(cells[headerIndices['caller name']]).attr('data-field', 'cnam');
        $(cells[headerIndices['unique id']]).attr('data-field', 'uniqueid');
        $(cells[headerIndices['tagname']]).attr('data-field', 'tagname');

        if (indexval > 0) {
            $(cells[indexval]).attr('data-field', 'averageSentiment');
            var sentiment = $(this).find('td[data-field="averageSentiment"]').text().trim().toLowerCase();
            $(cells[indexval]).css('text-transform', 'uppercase');

            if (sentiment === 'negative') {
                $(cells[indexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.negative[0]};">${sentiment.toUpperCase()}</span>`);
            } else if (sentiment === 'neutral') {
                $(cells[indexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.neutral[0]};">${sentiment.toUpperCase()}</span>`);
            } else if (sentiment === 'positive') {
                $(cells[indexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.positive[0]};">${sentiment.toUpperCase()}</span>`);
            }
        }
    });
}

function applyUploadFilesStyling($table) {
    let sentimentIndexval = 0;
    
    // Find the sentiment column index
    $table.find('thead th').each(function(i) {
        let headval = $(this).text().trim().toLowerCase();
        if (headval == 'sentiment') {
            sentimentIndexval = i;
            return false; // Break the loop
        }
    });

    $table.find('tbody tr').each(function() {
        var $row = $(this);
        var cells = $row.find('td');

        // Set data-field attribute for sentiment column
        if (sentimentIndexval > 0) {
            $(cells[sentimentIndexval]).attr('data-field', 'sentiment');
            var sentiment = $(cells[sentimentIndexval]).text().trim().toLowerCase();
            $(cells[sentimentIndexval]).css('text-transform', 'uppercase');

            if (sentiment === 'negative') {
                $(cells[sentimentIndexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.negative[0]};">${sentiment.toUpperCase()}</span>`);
            } else if (sentiment === 'neutral') {
                $(cells[sentimentIndexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.neutral[0]};">${sentiment.toUpperCase()}</span>`);
            } else if (sentiment === 'positive') {
                $(cells[sentimentIndexval]).html(`<span style="font-weight: bold; color: ${sentimentAssets.positive[0]};">${sentiment.toUpperCase()}</span>`);
            }
        }
    });
}

var chartObj = {
    callsPerHour: '',
    reportGraph: '',
};

function changeChartType(id, type) {
    chartObj[id].transform(type)
}

$(".filter_container").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();
    let view = $(this).find('input[name="view"]').val();
    if(view == 'uploadtranscriptions') {
        const datetime = $(this).find('input[name="datetime"]').val();
        loadUploadedFiles(datetime);
    } else {
        let filterVal = filterTypes();
        $('#table-scribeTranscripts').bootstrapTable('resetSearch','');
        getvoiceTranscripts(filterVal['start_date'],filterVal['end_date'], filterVal['reportType'],filterVal['recordType']);
    }
});


$('select[name="reportType"]').on('change',function(){
    $('#table-scribeTranscripts').bootstrapTable('resetSearch', '');
    let filterVal = filterTypes();
    getvoiceTranscripts(filterVal['start_date'],filterVal['end_date'],filterVal['reportType'],filterVal['recordType']);

});


function getGraphData(id, columns, chartType, xaxis, $flag, pattern = '',tittle='') {
    if (pattern != '') {
        pat = pattern
    } else {
        pat = ['#023003', '#f0150a', '#f76802'];
    }

    if (tittle != '') {
        tit = tittle
    } else {
        tit ="not defined";
    }
    if ($flag == 1) {
        c3.generate({
            bindto: `#${id}`, // Replace with your element ID
            data: {
                x: 'x', // Specify x-axis
                columns: columns,
                types: {
                    Positive: 'bar',
                    Neutral: 'bar',
                    Negative: 'bar'
                },
                groups: [['Positive', 'Neutral', 'Negative']]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d' // Format of dates on x-axis
                    }
                }
            },
            color: {
                pattern: ['#023003', '#f0150a', '#f76802'] // Colors for each series
            },
            bar: {
                width: {
                    ratio: 0.5 // Adjust bar width
                }
            }
        });
    } else {
        chartObj[id] = c3.generate({
            bindto: `#${id}`,
            data: {
                columns: columns,
                type: chartType,
                labels: {
                    format: function (value) {
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
                        format: function (value) {
                            if (value % 1 !== 0) {
                                return '';
                            } else {
                                return value;
                            }
                        }
                    }
                }
            },
            color: {
                pattern: pat
            },donut: {
               title: _(tit)
            },
            oninit:function() {
                if(id=='overallcall'){
                    d3.select(`#${id}`).selectAll('.c3-target-Inbound').on('click', function(event, d) {
                        navigateToList(event,d,'inbound','callrecording',id);
                    });
                    d3.select(`#${id}`).selectAll('.c3-target-Outbound').on('click', function(event, d) {
                        navigateToList(event,d,'outbound','callrecording',id);
                    });
                    d3.select(`#${id}`).selectAll('.c3-target-Internal').on('click', function(event, d) {
                        navigateToList(event,d,'internal','callrecording',id);
                    });
                }

                if(id=='voicemail'){
                    d3.select(`#${id}`).selectAll('.c3-target-Inbound').on('click', function(event, d) {
                        navigateToList(event,d,'inbound','voicemail',id);
                    });
                    d3.select(`#${id}`).selectAll('.c3-target-Internal').on('click', function(event, d) {
                        navigateToList(event,d,'internal','voicemail',id);
                    });
                }

                if(id=='overallsentiments'){
                    d3.select(`#${id}`).selectAll('.c3-target-Neutral').on('click', function(event, d) {
                        navigateToList(event,d,'allcalls','',id,'neutral');
                    });
                    d3.select(`#${id}`).selectAll('.c3-target-Negative').on('click', function(event, d) {
                        navigateToList(event,d,'allcalls','',id,'negative');
                    });
                    d3.select(`#${id}`).selectAll('.c3-target-Positive').on('click', function(event, d) {
                        navigateToList(event,d,'allcalls','',id,'positive');
                    });
                }
            },
            tooltip: {
                grouped: false,
                format: {
                    title: function (d) { return ''; },
                    value: function (value, ratio, id) {
                        var value1 = (value == 0.01)?"0":value;
                        return value1;
                    }
                }
            }
        });
    }
}

function removeSpin() {
    $('.fa-spinner').removeClass('fa-spin');
    $('.fa-spinner').addClass('no-spin');
    $('.fa-spinner').css('display', 'none');
}

function loadPage(page) {
    const filterVal = filterTypes();
    var dateval =  $('#filter_date_time').val();
    $('#table-scribeTranscripts').bootstrapTable('resetSearch', '');
    if (page == 'graph') {
        document.getElementById('switchbtngraph').style.setProperty('background', '#d6e4dd', 'important');
        document.getElementById('switchbtndata').style.setProperty('background', '#ffffff', 'important');
        this.pageval = 'graph';
        document.getElementById('graphdata').classList.remove('hidden');
        document.getElementById('data').classList.add('hidden');
        //filters to null
        const today = new Date().toISOString().split('T')[0];
        const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if(filterVal['recordType']=='voicemail'){
            let report = filterVal['reportType'] + " voicemail";
            $('select[name="reportType"]').val(report);
        }else{
            $('select[name="reportType"]').val(filterVal['reportType']);
        }
        $('#filter_date_time').val(dateval);
        getvoiceTranscripts(filterVal['start_date'],filterVal['end_date'], filterVal['reportType'],filterVal['recordType']);
    } else if (page == 'list') {
        document.getElementById('switchbtngraph').style.setProperty('background', '#ffffff', 'important');
        document.getElementById('switchbtndata').style.setProperty('background', '#d6e4dd', 'important')
        this.pageval = 'list';
        document.getElementById('data').classList.remove('hidden');
        document.getElementById('graphdata').classList.add('hidden');
        if(filterVal['recordType']=='voicemail'){
            let report = filterVal['reportType'] + " voicemail";
            $('select[name="reportType"]').val(report);
        }else{
            $('select[name="reportType"]').val(filterVal['reportType']);
        }
        getvoiceTranscripts(filterVal['start_date'],filterVal['end_date'], filterVal['reportType'],filterVal['recordType']);
    }
}

function handleBarClick(event,d,type,record){
    this.hasRedirected=true;
    localStorage.setItem('hasRedirected', 'true');
    localStorage.setItem('redirectreportType',type);
    localStorage.setItem('recordingtype',record);
    var url = window.displayUrl +'?display='+moduleName+'&view=transcriptions';
    if(this.hasRedirected){
        window.location.href = url;
        return;
    }
}

function viewChat(id) {
    let eyeShow=document.getElementById('eyeShow');
    let eyeHide=document.getElementById('eyeHide');
    if(id === 'eyeShow') {
        eyeShow.style.display = 'none';
        eyeHide.style.display = 'block';
        // $('#chatContainer').css('min-height','450px');
        $('#chatContainer').css('min-height','250px');
        $('.playrecordcontent').css('height','600px');
    } else if(id==='eyeHide') {
        eyeShow.style.display = 'block';
        eyeHide.style.display = 'none';
        $('#chatContainer').css('min-height','160px');
        $('.playrecordcontent').css('height','400px');
    }
}


$('.calendarIcon').click(function(){
    $("#filter_date_time").click();
});

function filterTypes(){
    let reportType = $('select[name="reportType"]').val();
    let recordType = '';
    var rtype = '';
    if(reportType){
        let type =reportType.split(" ");
        if(type.length == 2){
            recordType = type[1]
            rtype = type[0]
        }else{
            recordType = 'callrecording';
            rtype = reportType;
        }
    }
    let datetime = $('#filter_date_time').val();
    var start_date='';
    var end_date='';
    if(datetime){
        let dates = datetime.split(' - ');
        start_date = dates[0];
        end_date = dates[1];
    }

    const response ={
        reportType:rtype,
        recordType:recordType,
        start_date : start_date,
        end_date   : end_date
    }
    return response;

}

function enableuser(){
    let navigate =  window.displayUrl+'?display=userman#groups';
    window.location.href = navigate;
}

function navigateToList(event,d,callDirection,recordType,id,sentimets) {
    filterVal = filterTypes();
    document.getElementById('switchbtngraph').style.setProperty('background', '#ffffff', 'important');
    document.getElementById('switchbtndata').style.setProperty('background', '#d6e4dd', 'important')
    this.pageval = 'list';
    document.getElementById('data').classList.remove('hidden');
    document.getElementById('graphdata').classList.add('hidden');
    if(recordType=='voicemail'){
        let report = callDirection + " voicemail";
        $('select[name="reportType"]').val(report);
    }else{
        $('select[name="reportType"]').val(callDirection);
    }
    $flag =1;
    if(id=='overallsentiments'){
        sentimet = sentimets.trim();
        $flag=0;
        $('#table-scribeTranscripts').bootstrapTable('refresh', {
            search: true,pagination: true,search: true, showColumns: true,showRefresh: true,resetSearch:true
        });
        $('#table-scribeTranscripts').bootstrapTable('resetSearch', sentimet);
    }
    if($flag==1){
        getvoiceTranscripts(filterVal['start_date'],filterVal['end_date'], callDirection,recordType);
    }
}

$('#table-scribeTranscripts').on('search.bs.table', function (e, text) {
    if (text !== '' && text !== null) {
        let isMatchFound = false;
      $('#table-scribeTranscripts tbody tr').each(function () {
        let row = $(this);
        let isShow = false;
        let sentimentValue = row.find('td[data-field="averageSentiment"]').text().toLowerCase().trim();
        let callFrom = row.find('td[data-field="callFrom"]').text().toLowerCase().trim();
        let callTo = row.find('td[data-field="callTo"]').text().toLowerCase().trim();
        let filedate = row.find('td[data-field="filedate"]').text().toLowerCase().trim();
        let filetype = row.find('td[data-field="filetype"]').text().toLowerCase().trim();
        let formatSeconds = row.find('td[data-field="duration"]').text().toLowerCase().trim();
        let callDirection = row.find('td[data-field="callDirection"]').text().toLowerCase().trim();
        let callerId = row.find('td[data-field="cnum"]').text().toLowerCase().trim();
        let callerName = row.find('td[data-field="cnam"]').text().toLowerCase().trim();
        let uniqueid = row.find('td[data-field="uniqueid"]').text().toLowerCase().trim();
        let tagname = row.find('td[data-field="tagname"] a.tagdetailview').text().toLowerCase().trim();

        if(sentimentValue.includes(text.toLowerCase()) || callFrom.includes(text.toLowerCase()) || callTo.includes(text.toLowerCase()) || filedate.includes(text.toLowerCase()) || filetype.includes(text.toLowerCase()) || callDirection.includes(text.toLowerCase()) || formatSeconds.includes(text.toLowerCase()) || callerName.includes(text.toLowerCase()) || callerId.includes(text.toLowerCase()) || uniqueid.includes(text.toLowerCase()) || tagname.includes(text.toLowerCase())){
            isShow = true;
            isMatchFound=true;
        }
        if (isShow) {
          row.show();
        } else {
          row.hide();
        }
      });
      if (!isMatchFound) {
        $('#table-scribeTranscripts tbody').html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
      }
      $('#table-scribeTranscripts').bootstrapTable('resetSearch', text);
    } else {
      $('#table-scribeTranscripts tbody tr').show();
    }
});

$('#pendingTranscription').on('search.bs.table', function (e, text) {
    let isMatchFound = false;
    if (text !== '' && text !== null) {
      $('#pendingTranscription tbody tr').each(function () {
        let isShow = false;
        let row = $(this);
        let sentimentValue = row.find('td[data-field="averageSentiment"]').text().toLowerCase().trim();
        let callFrom = row.find('td[data-field="callFrom"]').text().toLowerCase().trim();
        let callTo = row.find('td[data-field="callTo"]').text().toLowerCase().trim();
        let filedate = row.find('td[data-field="filedate"]').text().toLowerCase().trim();
        let filetype = row.find('td[data-field="filetype"]').text().toLowerCase().trim();
        let formatSeconds = row.find('td[data-field="duration"]').text().toLowerCase().trim();
        let callDirection = row.find('td[data-field="callDirection"]').text().toLowerCase().trim();
        let status = row.find('td[data-field="status"]').text().toLowerCase().trim();
        let callerId = row.find('td[data-field="cnum"]').text().toLowerCase().trim();
        let callerName = row.find('td[data-field="cnam"]').text().toLowerCase().trim();
        let uniqueid = row.find('td[data-field="uniqueid"]').text().toLowerCase().trim();
        if(sentimentValue.includes(text.toLowerCase()) || callFrom.includes(text.toLowerCase()) || callTo.includes(text.toLowerCase()) || filedate.includes(text.toLowerCase()) || filetype.includes(text.toLowerCase()) || callDirection.includes(text.toLowerCase()) || formatSeconds.includes(text.toLowerCase()) || status.includes(text.toLowerCase()) || callerName.includes(text.toLowerCase()) || callerId.includes(text.toLowerCase()) || uniqueid.includes(text.toLowerCase())){
            isShow = true;
        }
        if (isShow) {
          row.show();
        } else {
          row.hide();
        }
      });
      if (!isMatchFound) {
        $('#table-scribeTranscripts tbody').html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
        $('#pendingTranscription tbody').html('<tr><td colspan="7" class="text-center">No matching records found</td></tr>');
      }
      $('#pendingTranscription').bootstrapTable('resetSearch', text);
    } else {
      $('#pendingTranscription tbody tr').show();
    }
});

function voicemailEmailSettingModalEnable() {
    const modalTitle = _('Voicemail Email Setting');
    const closeText = _('Close');
    const saveText = _('Save changes');
    const modalBody = `
    <div id="voicemailToggleGroup">
        <div class="col-md-5" id="voicemailToggleGroupLabel">
            <label class="control-label">${_('Voicemail Email Toggle : ')}</label>
        </div>
        <div class="col-md-9 radioset" id="voicemailRadioset">
            <input type="radio" name="voicemail_email_settings" id="voicemail_email_enable" value="enabled">
            <label for="voicemail_email_enable">Enable</label>
            <input type="radio" name="voicemail_email_settings" id="voicemail_email_disable" value="disabled">
            <label for="voicemail_email_disable">Disable</label>
        </div>
    </div>`;
    const modalHTML = `
    <div class="modal fade" id="voicemailModal" tabindex="-1" role="dialog" aria-labelledby="voicemailEmailModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header" id="voicemailEmailModalHeader">
                    <h3 class="modal-title" id="voicemailModalTitle">${modalTitle}</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="voicemailForm">
                    <div class="modal-body">
                        <p>${modalBody}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">${saveText}</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">${closeText}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    $('#voicemailModal').modal('show');
    var voicemailEmailToggle = getVoicemailEmailSettings();
    if (voicemailEmailToggle === "enabled") {
        document.getElementById("voicemail_email_enable").checked = true;
    } else if (voicemailEmailToggle === "disabled") {
        document.getElementById("voicemail_email_disable").checked = true;
    }

    const voicemailForm = document.getElementById('voicemailForm');
    if (voicemailForm) {
        voicemailForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const voicemailEmailSettings = document.querySelector('input[name="voicemail_email_settings"]:checked').value;
            if (voicemailEmailSettings == 'enabled') {
                if (confirm(_('Enabling the Voicemail Email toggle will override the Voicemail Admin Mail command. Are you sure?'))) {
                    setVoicemailEmailSettings(voicemailEmailSettings);
                    $('#voicemailModal').modal('hide');
                    location.reload();
                }
            } else {
                setVoicemailEmailSettings(voicemailEmailSettings);
                $('#voicemailModal').modal('hide');
                location.reload();
            }
        });
    }
    $('#voicemailModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function getVoicemailEmailSettings() {
	var result = $.ajax({
		url: "ajax.php?module="+moduleName+"&command=getVoicemailEmailSettings",
		type: 'GET',
		async: false
	});
    obj = JSON.parse(result.responseText);
    if (obj.status) {
        return obj.message;
    }
    return obj.status;
}

function setVoicemailEmailSettings(value) {
    var result = $.ajax({
		url: "ajax.php?module="+moduleName+"&command=setVoicemailEmailSettings&voicemailEmailSettings="+value,
		type: 'POST',
		async: false
	});
    obj = JSON.parse(result.responseText);
    if (!obj.status) {
        alert(obj.message);
        return obj.status;
    }
    if(obj.status){
        $('#button_reload').css('display', 'inline-block');
    }
    const toggleValue = value.charAt(0).toUpperCase() + value.slice(1);
    fpbxToast(_('Voicemail Email Toggle ') + toggleValue, _('Success'), 'success');
	return obj.status;
}

function getTranscriptionDataForModels(id, buttonType, type) {
    if (type == 'upload') {
        var result = $.ajax({
            url: "ajax.php?module="+moduleName+"&command=getUploadDetails&uploadId="+id,
            type: 'GET',
            async: false
        });
        return JSON.parse(result.responseText);
    } else {
        var result = $.ajax({
            url: "ajax.php?module="+moduleName+"&command=getTranscriptionDataForModels&id="+id+"&buttonType="+buttonType,
            type: 'GET',
            async: false
        });
        return JSON.parse(result.responseText);
    }
}

function postCallRecordingEnable() {
    const modalHTML = `
    <div class="modal fade" id="postcallrecord" tabindex="-1" role="dialog" aria-labelledby="voicemailEmailModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header" id="voicemailEmailModalHeader">
                    <h3 class="modal-title" id="voicemailModalTitle">Multi-Channel Call Recording Setting</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="postCallRecordingForm">
                    <div class="modal-body">
                        <div class="alterpostcall">
                            <span class="material-symbols-outlined">crisis_alert</span>
                            To enable multi-channel call recording, we need to use a post-call recording script.
                        </div>
                        <div id="voicemailToggleGroup">
                            <div class="col-md-6" id="voicemailToggleGroupLabel">
                                <label class="control-label">${_('Enable Scribe Post Call script: ')}</label>
                            </div>
                            <div class="col-md-6 radioset" id="voicemailRadioset">
                                <input type="radio" name="post_call_settings" id="post_call_enable" value="enabled">
                                <label for="post_call_enable">Enable</label>
                                <input type="radio" name="post_call_settings" id="post_call_disable" value="disabled">
                                <label for="post_call_disable">Disable</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save changes</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    $('#postcallrecord').modal('show');
    var postcallToggle = getPostCallRecordingSettings();
    if (postcallToggle === "enabled") {
        document.getElementById("post_call_enable").checked = true;
    } else if (postcallToggle === "disabled") {
        document.getElementById("post_call_disable").checked = true;
    }
    const postCallRecordingForm = document.getElementById('postCallRecordingForm');

    if (postCallRecordingForm) {
        postCallRecordingForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const callRecordSettings = document.querySelector('input[name="post_call_settings"]:checked').value;

            if (callRecordSettings == 'enabled') {
                if (confirm(_('Enabling the Multi-Channel Call Recording will override the Post Call Recording Script in the Advanced Settings. Are you sure?'))) {
                    $('#postcallrecord').modal('hide');
                    postCallRecordingSettings(callRecordSettings);
                    location.reload();
                }
            } else {
                $('#postcallrecord').modal('hide');
                postCallRecordingSettings(callRecordSettings);
                location.reload();
            }
        });
    }
    $('#postcallrecord').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function postCallRecordingSettings(fromval) {
    var result = $.ajax({
        url: "ajax.php?module=" + moduleName + "&command=setPostCallRecordSettings&post_call_setting_val=" + fromval,
        type: 'POST',
        async: false
    });
    obj = JSON.parse(result.responseText);
    if (!obj.status) {
        alert(obj.message);
        return obj.status;
    }
    if(obj.status){
        $('#button_reload').css('display', 'inline-block');
    }
    fpbxToast(_('Multi-Channel Call Recording transcription ') + obj.message, _('Success'), 'success');
}
function getPostCallRecordingSettings() {
    var result = $.ajax({
        url: "ajax.php?module=" + moduleName + "&command=getPostCallRecordSettings",
        type: 'GET',
        async: false
    });
    obj = JSON.parse(result.responseText);
    if (obj.message == 'enabled') {
        return "enabled";
    } else {
        return "disabled";
    }
}

function postCallRecording(){
    const callRecordSettings = document.querySelector('input[name="post_call_settings"]:checked').value;
    if (callRecordSettings == 'enabled') {
        if (confirm(_('Enabling the Multi-Channel Call Recording will override the Post Call Recording Script in the Advanced Settings. Are you sure?'))) {
            // location.reload();
            postCallRecordingSettings(callRecordSettings);
        }
    } else {
        postCallRecordingSettings(callRecordSettings);
        // location.reload();
    }
    var postcallToggle = getPostCallRecordingSettings();
    if (postcallToggle === "enabled") {
        document.getElementById("post_call_enable").checked = true;
    } else if (postcallToggle === "disabled") {
        document.getElementById("post_call_disable").checked = true;
    }
}

function voicemailEmailSettingModal(){
    const voicemailEmailSettings = document.querySelector('input[name="voicemail_email_settings"]:checked').value;
    if (voicemailEmailSettings == 'enabled') {
        var conf = confirm(_('Enabling the Voicemail Email toggle will override the Voicemail Admin Mail command and Server Email. Are you sure?'));
        if (conf === true) {
            setVoicemailEmailSettings(voicemailEmailSettings);
            // location.reload();
        }
    } else {
        setVoicemailEmailSettings(voicemailEmailSettings);
        // location.reload();
    }
    var voicemailEmailToggle = getVoicemailEmailSettings();
    if (voicemailEmailToggle === "enabled") {
        document.getElementById("voicemail_email_enable").checked = true;
    } else if (voicemailEmailToggle === "disabled") {
        document.getElementById("voicemail_email_disable").checked = true;
    }
}

function showInfo(id,e){
    e.preventDefault();
    e.stopPropagation();
    $(`#${id}`).show();
}

function hideInfo(id,e){
    e.preventDefault();
    e.stopPropagation();
    $(`#${id}`).hide();
}

$('#playbackTranscriptionModal').on('hidden.bs.modal', function () {
    $(this).find('.modal-content').css({
        width: '100%',
        height: '100%'
    });
});

function downloadall(value, row, index){
    const checkboxhtml =`<input type="checkbox" data-id="${row.id}" onchange="selectCheckbox(this)">`;
    return checkboxhtml;
}
function download_upload_all(value, row, index){
    const checkboxhtml =`<input type="checkbox" data-id="${row.id}" onchange="selectUploadCheckbox(this)">`;
    return checkboxhtml;
}

const downloadIds = [];let enablecheckbox= [];
function selectCheckbox(checkbox){
    var $row = $(checkbox).closest('tr');
    const isChecked = checkbox.checked;
    const row_id =  checkbox.getAttribute('data-id');
    let checkboxInput = document.querySelector(`input[data-id="${row_id}"]`);
    if(isChecked){
        if(checkboxInput){
            checkboxInput.setAttribute('checked','checked');
            checkboxInput.checked = true;
            $row.css('border-left', '1px solid red');
            let isIdsIncludes = downloadIds.includes(row_id);
            if(!isIdsIncludes){
                downloadIds.push(row_id);
            }
        }
    }else{
        if(checkboxInput){
            checkboxInput.removeAttribute('checked');
            checkboxInput.checked = false;
            $row.css('border-left', 'unset');
            let idexof = downloadIds.indexOf(row_id);
            if(idexof>=0){
                downloadIds.splice(idexof,1)
            }
        }
    }
    localStorage.setItem('downloadIds',JSON.stringify(downloadIds));
    downloadIdso = localStorage.getItem('downloadIds');
    enablecheckbox = document.querySelectorAll(`td input[type="checkbox"]:checked`);
    if( downloadIdso.length > 2){
        $('#downloadtrans').prop('disabled', false);
        $('#downloadtrans').css('opacity', 1);
        $('#sendemail').prop('disabled', false);
        $('#sendemail').css('opacity',1);
    }else{
        $('#downloadtrans').prop('disabled', true);
        $('#downloadtrans').css('opacity', 0.4);
        $('#sendemail').prop('disabled', true);
        $('#sendemail').css('opacity',0.4);
    }
}

const downloadUploadIds = []; let enableUploadCheckbox = [];
function selectUploadCheckbox(checkbox){
    var $row = $(checkbox).closest('tr');
    const isChecked = checkbox.checked;
    const row_id =  checkbox.getAttribute('data-id');
    let checkboxInput = document.querySelector(`input[data-id="${row_id}"]`);
    if(isChecked){
        checkboxInput.setAttribute('checked','checked');
        checkboxInput.checked = true;
        $row.css('border-left', '1px solid red');
        let isIdsIncludes = downloadUploadIds.includes(row_id);
        if(!isIdsIncludes){
            downloadUploadIds.push(row_id);
        }
    }else{
        checkboxInput.removeAttribute('checked');
        checkboxInput.checked = false;
        $row.css('border-left', 'unset');
        let idexof = downloadUploadIds.indexOf(row_id);
        if(idexof>=0){
            downloadUploadIds.splice(idexof,1)
        }
    }
    localStorage.setItem('downloadUploadIds',JSON.stringify(downloadUploadIds));
    downloadUploadIdso = localStorage.getItem('downloadUploadIds');
    enableUploadCheckbox = document.querySelectorAll(`td input[type="checkbox"]:checked`);
    if( downloadUploadIdso.length > 2){
        $('#downloadUploads').prop('disabled', false);
        $('#downloadUploads').css('opacity', 1);
        $('#senduploademail').prop('disabled', false);
        $('#senduploademail').css('opacity',1);
        $('#deleteUploads').prop('disabled', false);
        $('#deleteUploads').css('opacity',1);
    }else{
        $('#downloadUploads').prop('disabled', true);
        $('#downloadUploads').css('opacity', 0.4);
        $('#senduploademail').prop('disabled', true);
        $('#senduploademail').css('opacity',0.4);
        $('#deleteUploads').prop('disabled', true);
        $('#deleteUploads').css('opacity',0.4);
    }
} 

$('#table-scribeTranscripts').on('page-change.bs.table', function (e, number, size) {
    let downloadIds = localStorage.getItem('downloadIds');
    if( downloadIds){
        let ids = JSON.parse(downloadIds);
        ids.forEach(elm=>{
           let checkboxInput =  document.querySelector(`input[data-id="${elm}"]`);
           if(checkboxInput){
                checkboxInput.setAttribute("checked","checked");
                checkboxInput.checked = true;
           }
        });
    }
});
function selectAllCheckbox(event,id){
    let allcheckbox = event.checked;
    let pageSize = $(`#${id}`).bootstrapTable('getOptions').pageSize;
    let pageNumber = $(`#${id}`).bootstrapTable('getOptions').pageNumber;
    let selected =  $(`#${id}`).bootstrapTable('getData','selected');
    if(allcheckbox){
        event.setAttribute("checked","checked");
        $('#downloadtrans').prop('disabled', false);
        $('#downloadtrans').css('opacity',1);
        $('#sendemail').prop('disabled', false);
        $('#sendemail').css('opacity',1);
        allcheckbox.checked = true;
        if(selected){
                selected.forEach(elm=>{
                    let checkboxInput =  document.querySelector(`input[data-id="${elm.id}"]`);
                    if(checkboxInput){
                        checkboxInput.setAttribute('checked','checked');
                        checkboxInput.checked = true;
                        var $row = $(checkboxInput).closest('tr');
                        $row.css('border-left', '1px solid red');
                        let isIdsIncludes = downloadIds.includes(elm.id);
                        if(!isIdsIncludes){
                            downloadIds.push(elm.id);
                        }
                    }
                });
        }
    }else{
        $('#downloadtrans').prop('disabled', true);
        $('#downloadtrans').css('opacity',0.4);
        $('#sendemail').prop('disabled', true);
        $('#sendemail').css('opacity',0.4);
        event.removeAttribute('checked');
        allcheckbox.checked = false;
        let allelems = document.querySelectorAll(`td input[type="checkbox"]:checked`);
        allelems.forEach(elm=>{
            elm.checked = false;
            elm.removeAttribute('checked');
            var $row = $(elm).closest('tr');
            $row.css('border-left', 'unset');
        });
        downloadIds.length  = 0;
    }
    localStorage.setItem('downloadIds',JSON.stringify(downloadIds));
    downloadIdso = localStorage.getItem('downloadIds');
}
function selectUploadAllCheckbox(event,id){
    let allcheckbox = event.checked;
    let pageSize = $(`#${id}`).bootstrapTable('getOptions').pageSize;
    let pageNumber = $(`#${id}`).bootstrapTable('getOptions').pageNumber;
    let selected =  $(`#${id}`).bootstrapTable('getData','selected');
    if(allcheckbox){
        event.setAttribute("checked","checked");
        allcheckbox.checked = true;
        if(selected){
            selected.forEach(elm=>{
                let checkboxInput =  document.querySelector(`input[data-id="${elm.id}"]`);
                if(checkboxInput){
                    checkboxInput.setAttribute('checked','checked');
                    checkboxInput.checked = true;
                    var $row = $(checkboxInput).closest('tr');
                    $row.css('border-left', '1px solid red');
                    let isIdsIncludes = downloadUploadIds.includes(elm.id);
                    if(!isIdsIncludes){
                        downloadUploadIds.push(elm.id);
                    }
                }
            });
        }
        $('#downloadUploads').prop('disabled', false);
        $('#downloadUploads').css('opacity', 1);
        $('#senduploademail').prop('disabled', false);
        $('#senduploademail').css('opacity',1);
        $('#deleteUploads').prop('disabled', false);
        $('#deleteUploads').css('opacity',1);
    }else{
        event.removeAttribute('checked');
        allcheckbox.checked = false;
        let allelems = document.querySelectorAll(`td input[type="checkbox"]:checked`);
        allelems.forEach(elm=>{
            elm.checked = false;
            elm.removeAttribute('checked');
            var $row = $(elm).closest('tr');
            $row.css('border-left', 'unset');
        });
        downloadUploadIds.length  = 0;
        $('#downloadUploads').prop('disabled', true);
        $('#downloadUploads').css('opacity', 0.4);
        $('#senduploademail').prop('disabled', true);
        $('#senduploademail').css('opacity',0.4);
        $('#deleteUploads').prop('disabled', true);
        $('#deleteUploads').css('opacity',0.4);
    }
    localStorage.setItem('downloadUploadIds',JSON.stringify(downloadUploadIds));
}

$('#downloadtrans').on('click',function(event){
    let getIds = localStorage.getItem('downloadIds');
    downloadPdf(getIds);
})

$('#sendemail').on('click',function(event){
    $('#sentimentEmailModal').modal("show");
});

$('#senduploademail').on('click',function(event){
    $('#sentimentEmailModal').modal("show");
});

$('#sendSentimentEmail').on('click',function(event){
    let getIds = localStorage.getItem('downloadIds');
    let formType = $('#form_type').val();
    if(formType == 'upload'){
        getIds = localStorage.getItem('downloadUploadIds');
    }  
    console.log(getIds);
    let semail = $('#semail').val();
    let ssubject = $('#ssubject').val();
    let sbody = $('#sbody').val();
    let attachrecordings = $("input[name='attachrecordings']:checked").val();
    let attachtranscriptions = $("input[name='attachtranscriptions']:checked").val();
    if(!getIds) {
        fpbxToast(_('No rows selected'),_("Error"),'error');
        return;
    }
    if(!semail) {
        fpbxToast(_('The email field cannot be empty. Please enter a valid email address.'),_("Error"),'error');
        return;
    }
    if(!ssubject) {
        fpbxToast(_('The subject field cannot be empty. Please enter a subject before proceeding.'),_("Error"),'error');
        return;
    }
    if(!sbody) {
        fpbxToast(_('The email body cannot be empty. Please enter a message before sending.'),_("Error"),'error');
        return;
    }
    if(attachrecordings == 'no' && attachtranscriptions == 'no') {
        fpbxToast(_("Please confirm by selecting 'Yes' on at least one attachment."),_("Error"),'error');
        return;
    }

    sendSentimentEmail(getIds,semail,ssubject,sbody,attachrecordings,attachtranscriptions,formType);
});

function sendSentimentEmail(getIds,semail,ssubject,sbody,attachrecordings,attachtranscriptions,formType){
    let parsedIds = JSON.parse(getIds);
    parsedIds2 =  JSON.stringify(parsedIds);
    if(parsedIds){
        let data = {
            transIds: parsedIds2,
            semail: semail,
            ssubject: ssubject,
            sbody: sbody,
            attachrecordings: attachrecordings,
            attachtranscriptions: attachtranscriptions,
            formType: formType,
        };

        $.post("ajax.php?module=scribe&command=sendSentimentEmail", data, function (res) {
            if (res.status) {
                fpbxToast(_(res.message));
                $('#sentimentEmailModal').modal("hide");
                localStorage.clear('downloadIds');
                localStorage.clear('downloadUploadIds');
                $('#checkallbox').attr('checked','');
                $('#downloadtrans').prop('disabled', true);
                $('#downloadtrans').css('opacity',0.4);
                $('#sendemail').prop('disabled', true);
                $('#sendemail').css('opacity',0.4);
                $('#downloadUploads').prop('disabled', true);
                $('#downloadUploads').css('opacity',0.4);
                $('#senduploademail').prop('disabled', true);
                $('#senduploademail').css('opacity',0.4);
                $('#deleteUploads').prop('disabled', true);
                $('#deleteUploads').css('opacity',0.4);
                $('#table-scribeTranscripts tr').css('border-left', 'unset');
                let allelems = document.querySelectorAll(`td input[type="checkbox"]:checked`);
                allelems.forEach(elm=>{
                    elm.checked = false;
                    elm.removeAttribute('checked');
                });
                downloadIds.length  = 0;

                //reset email input fields to default
                $('#semail').val($('#semail')[0].defaultValue);
                $('#ssubject').val($('#ssubject')[0].defaultValue);
                $('#sbody').val($('#sbody')[0].defaultValue);
                $('input[name="attachrecordings"]').each(function() {
                    $(this).prop('checked', this.defaultChecked);
                });
                $('input[name="attachtranscriptions"]').each(function() {
                    $(this).prop('checked', this.defaultChecked);
                });
            } else {
                fpbxToast(_(res.message), _('Error'), 'error');
            }
        });
    }else{
        alert("Please select the records to send email");
    }
}

function downloadPdf(getIds){
    let parsedIds = JSON.parse(getIds);
    parsedIds2 =  JSON.stringify(parsedIds);
    if(parsedIds){
        window.open(`ajax.php?module=${moduleName}&command=downloadPdf&download=${encodeURIComponent(parsedIds2)}`);
        localStorage.clear('downloadIds');
        // $('#downloadtrans').css('display','none');
        // $('#checkallbox').removeAttribute('checked');
        $('#checkallbox').attr('checked','');
        $('#downloadtrans').prop('disabled', true);
        $('#downloadtrans').css('opacity',0.4);
        $('#sendemail').prop('disabled', true);
        $('#sendemail').css('opacity',0.4);
        $('#table-scribeTranscripts tr').css('border-left', 'unset');
        let allelems = document.querySelectorAll(`td input[type="checkbox"]:checked`);
        allelems.forEach(elm=>{
            elm.checked = false;
            elm.removeAttribute('checked');
        });
        downloadIds.length  = 0;
    }else{
        alert("Please select the records to download");
    }
}

function listAllAndDefaultLanguge(){
    var result = $.ajax({
        url:"ajax.php?module="+ moduleName + "&command=getDefaultLang",
        typr:"GET",
        async:false
    }).done(function(data){
        language = data.data;
        defaultLang = data.default_lang;
        $('#scribelanguage').empty();
        let optionList = '';
        optionList += `<option val='null' >Select Language</option>`; 
        for(let code in language){
            if(code == defaultLang){
                optionList += `<option val=${code} selected>${language[code]}</option>`; 
            }else{
                optionList += `<option val=${code} >${language[code]}</option>`; 
            }
        }
        $('#scribelanguage').append(optionList);

    });
}
var selctedLang = '';
function selectMultilang(e){
    selctedLang = '';
    selctedLang =  $('#scribelanguage :selected').attr('val');
}

$('#scribelanguage').on('change',function(){
   let  selctedLang1 =  $('#scribelanguage :selected').attr('val');
    if(selctedLang1){
        if (confirm(_('Scribe API requires the language used in the recording audio files (voicemail and call recording). Choosing a different language could break the voice transcription. Are you sure you want to continue?'))) {
            saveSelectedLanguage(selctedLang1);
        }
    }
});
var usermanScribeLan = '';

function saveSelectedLanguage(lang){
    if(lang.length > 0 ){
        saveScribeLang(lang);
    }else{
        alert("Please select the language to set.");
    }
    selctedLang = '';
}
var listLang =[];

function saveScribeLang(lang){
    if(lang.length > 0){
            $.ajax({
                 url: "ajax.php?module=" + moduleName + "&command=saveScribeLang",
                type:'POST',
                data:{lang:lang},
                dataType: 'json',
                success:function(result){
                    selctedLang = '';
                    listAllAndDefaultLanguge();
                    fpbxToast(result.message, _('Success'), 'success');
                },
                fail:function(error){
                    selctedLang = '';
                    fpbxToast(_(error),_("Error"),'error');
                }
            });
    }else{
        selctedLang = '';
        alert("Please select a language.");
    }

}
$("#addTag").on('submit',function(e){
    e.preventDefault();
    if (!$("#tagname").val()) {
        fpbxToast(_('Please fill the name of the tag'), _('Error'), 'error');
        return; // Exit if any field is empty
    }

    if (!$("#tagwords").val()) {
        fpbxToast(_('Please enter atleast one keyword'), _('Error'), 'error');
        return; // Exit if any field is empty
    }

    if($("#tagid").val()) {
        for (var key in allTagNames) {
            if (allTagNames.hasOwnProperty(key) && key !== $("#tagid").val() && allTagNames[key] === $("#tagname").val()) {
                fpbxToast(_('Tag name already exists'), _('Error'), 'error');
                return;
            }
        }
    } else if(Object.values(allTagNames).includes($("#tagname").val())) {
        fpbxToast(_('Tag name already exists'), _('Error'), 'error');
        return;
    }

    if($("input[name='enableNotification']:checked").val() == 'yes') {
        if(!$("#email").val()) {
            fpbxToast(_('Email address is required to send the notification.'), _('Error'), 'error');
            return;
        }

        if(!$("#threshold").val()) {
            fpbxToast(_('Threshold is required to trigger the email notification.'), _('Error'), 'error');
            return;
        }
    }
    const mailType = $("input[name='notificationEmailType']:checked").val();
    let data = {
        tagid: $("#tagid").val(),
        tagname: $("#tagname").val(),
        tagwords: $("#tagwords").val(),
        enableNotification: $("input[name='enableNotification']:checked").val(),
        email: $("#email").val(),
        threshold: $("#threshold").val(),
        emailtype: mailType,
        subject: $("#notificationEmailSubject").val(),
        body: ((mailType === 'text') ? encodeURIComponent($('#notificationTextEmailBody').val()) : encodeURIComponent($('#notificationHtmlEmailBody').Editor('getText'))),
    };
    if (data.body.trim() === '%3Cbr%3E') {
        data.body = '';
    }
    $.post("ajax.php?module="+moduleName+"&command=upsertTag", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
            window.location = '?display='+moduleName+'&view=tags';
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
});

function linkFormatter(value){
    var html = '<a href="?display=scribe&view=tagform&tagid=' + value + '" ><i class="fa fa-pencil"></i></a>';
    html += '&nbsp;<a onclick="deletetag(this, '+ value +')" href="#"><i class="fa fa-trash"></i></a>';
	return html;
}

function deletetag(e,tagid) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault(); // Prevent the default behavior of the anchor tag
    }

    if (confirm("Deleting this tag will remove it from all transcriptions where it appears. Are you sure you want to proceed?")) {
        let data = {
            tagid: tagid
        };
        $.post("ajax.php?module=scribe&command=deletetag", data, function (res) {
            if (res.status) {
                fpbxToast(_(res.message));
                $('#taggrid').bootstrapTable('refresh',{});
            } else {
                fpbxToast(_('There was an error updating the tag'), _('Error'), 'error');
            }
        });
    } else {
        return;
    }
}

function opnTagdetailModal(element) {
    let data = {
        transcription_id: element.data("id")
    };
    $.post("ajax.php?module=scribe&command=gettagdetails", data, function (res) {
        if (res.status && res.view) {
            $("body").append(res.view);
            $("#tagsnmodal-" + element.data("id")).modal("show");
        } else {
            fpbxToast(_('There was an error getting tag details'), _('Error'), 'error');
        }
    });
}

$($("input[name='enableNotification']")).on('click',function(event){
    if($("input[name='enableNotification']:checked").val() == 'yes') {
        $("#mailinfo").show();
    } else {
        $("#mailinfo").hide();
    }
});
