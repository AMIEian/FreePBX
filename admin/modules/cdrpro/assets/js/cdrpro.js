let chartObj = {
    callsPerHour: '',
    reportGraph: ''
};

$(function () {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    let page = getQueryParams('display');

    if (page == 'cdrpro') {
        setLoader(true);

        /** INITIALISE DATE RANGE PICKER */
        let startDate = moment().subtract(29, 'days').startOf('day');
        let endDate = moment().endOf('day');
        let datetime = getQueryParams('datetime');
        if (datetime && datetime.split(' - ').length > 0) {
            datetime = decodeURIComponent(datetime);
            startDate = datetime.split(' - ')[0];
            endDate = datetime.split(' - ')[1];
        }
        $('input[name="datetime"]').daterangepicker({
            timePicker: true,
            maxSpan: {
                year: 1
            },
            startDate: startDate,
            endDate: endDate,
            timePickerSeconds: true,
            locale: {
                format: 'YYYY-MM-DD HH:mm:ss'
            },
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
                'This Month': [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')],
                'Last Month': [moment().subtract(1, 'month').startOf('day'), moment().endOf('day')],
                'Last 3 Months': [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')]
            }
        });

        /** INITIALISE STORAGE MULTISELECT  */
        if ($("#filestoreLocation").length) {
            $('#filestoreLocation').multiselect({
                disableIfEmpty: true,
                disabledText: _('No Storage Locations'),
                enableFiltering: true,
                includeSelectAllOption: true,
                buttonWidth: '80%',
                enableLazyLoad: true
            });
            //get items
            $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=storageList`)
                .done(
                    function (data) {
                        $('#filestoreLocation').multiselect('dataprovider', data);
                    }
                )
                .fail(
                    function (jqxhr, textStatus, error) {
                        $('#filestoreLocation').multiselect('dataprovider', {});
                    }
                );
        }

        /** INITIALISE EXENSION MULTISELECT  */
        if ($(".extension-list").length) {
            $('.toggleReport').hide();
            $('.extension-list').multiselect({
                disableIfEmpty: true,
                disabledText: _('No Extensions Found'),
                enableFiltering: true,
                enableCaseInsensitiveFiltering: true,
                includeSelectAllOption: true,
                buttonWidth: '80%',
                enableLazyLoad: true,
                nonSelectedText: 'Select Extension'
            });
            //get items
            $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getExtensions`)
                .done(
                    function (data) {
                        $('.extension-list').multiselect('dataprovider', data);
                        let selectedExtensions = $('input[name="oldExtensions"]').val();
                        if (selectedExtensions && selectedExtensions.split(',').length) {
                            $('#extensionList').val(selectedExtensions.split(','));
                            $('#extensionList').multiselect("refresh");
                        }
                        $('.toggleReport').show();
                    }
                )
                .fail(
                    function (jqxhr, textStatus, error) {
                        $('.extension-list').multiselect('dataprovider', {});
                        $('.toggleReport').show();
                    }
                );
        }

        /** INITIALISE DID MULTISELECT  */
        if ($(".did-list").length) {
            $('.toggleReport').hide();
            $('.did-list').multiselect({
                disableIfEmpty: true,
                disabledText: _('No Dids Found'),
                enableFiltering: true,
                enableCaseInsensitiveFiltering: true,
                includeSelectAllOption: true,
                buttonWidth: '80%',
                enableLazyLoad: true,
                nonSelectedText: 'Select DID'
            });
            //get items
            $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getDIDs`)
                .done(
                    function (data) {
                        $('.did-list').multiselect('dataprovider', data);
                        let selectedDids = $('input[name="oldDids"]').val();
                        if (selectedDids && selectedDids.split(',').length) {
                            $('#didList').val(selectedDids.split(','));
                            $('#didList').multiselect("refresh");
                        }
                        $('.toggleReport').show();
                    }
                )
                .fail(
                    function (jqxhr, textStatus, error) {
                        $('.did-list').multiselect('dataprovider', {});
                        $('.toggleReport').show();
                    }
                );
        }

                /** INITIALISE RING GROUP MULTISELECT  */
                if ($(".ring-group-list").length) {
                    $('.toggleReport').hide();
                    $('.ring-group-list').multiselect({
                        disableIfEmpty: true,
                        disabledText: _('No Ring Group Found'),
                        enableFiltering: true,
                        enableCaseInsensitiveFiltering: true,
                        includeSelectAllOption: true,
                        buttonWidth: '80%',
                        enableLazyLoad: true,
                        nonSelectedText: 'Select Ring Group'
                    });
                    //get items
                    $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getRingGroups`)
                        .done(
                            function (data) {
                                $('.ring-group-list').multiselect('dataprovider', data);
                                let selectedRingGroups = $('input[name="oldRingGroups"]').val();
                                if (selectedRingGroups && selectedRingGroups.split(',').length) {
                                    $('#ringGroupList').val(selectedRingGroups.split(','));
                                    $('#ringGroupList').multiselect("refresh");
                                }
                                $('.toggleReport').show();
                            }
                        )
                        .fail(
                            function (jqxhr, textStatus, error) {
                                $('.ring-group-list').multiselect('dataprovider', {});
                                $('.toggleReport').show();
                            }
                        );
                }
                  /** INITIALISE GUEUES MULTISELECT  */
                if ($(".queue-list").length) {
                    $('.toggleReport').hide();
                    $('.queue-list').multiselect({
                        disableIfEmpty: true,
                        disabledText: _('No Queue Found'),
                        enableFiltering: true,
                        enableCaseInsensitiveFiltering: true,
                        includeSelectAllOption: true,
                        buttonWidth: '80%',
                        enableLazyLoad: true,
                        nonSelectedText: 'Select Queues'
                    });
                    //get items
                    $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getQueues`)
                        .done(
                            function (data) {
                                $('.queue-list').multiselect('dataprovider', data);
                                let selectedQueues = $('input[name="oldQueues"]').val();
                                if (selectedQueues && selectedQueues.split(',').length) {
                                    $('#queueList').val(selectedQueues.split(','));
                                    $('#queueList').multiselect("refresh");
                                }
                                $('.toggleReport').show();
                            }
                        )
                        .fail(
                            function (jqxhr, textStatus, error) {
                                $('.queue-list').multiselect('dataprovider', {});
                                $('.toggleReport').show();
                            }
                        );
                }

        /** GET REPORT DATA */
        let selectedReportType = $('input[name="oldReportType"]').val();
        let selectedDatetime = $('input[name="oldDatetime"]').val();

        if (selectedReportType == EXTENSION_DETAIL_REPORT || selectedReportType == EXTENSION_SUMMARY_REPORT) {
            hideAllDropDownExcept('extension');
            let selectedExtensions = $('input[name="oldExtensions"]').val();
            if (selectedExtensions && selectedExtensions.split(',').length) {
                getCdrData(selectedReportType, selectedDatetime, selectedExtensions);
            } else {
                setLoader(false);
                $('#cdrTableView').css('width', '100%').html(`<tr><td colspan="6" style="text-align: center;color:red;"><b>${_('Please Select Extensions')}</b></td></tr>`);
                $('#toolbar-cdr').hide();
                $('.cdr_summary_wrapper').hide();
                $('#tableHeading').hide();
            }
        } else if (selectedReportType == DID_DETAIL_REPORT) {
            hideAllDropDownExcept('did');
            let selectedDids = $('input[name="oldDids"]').val();
            if (selectedDids && selectedDids.split(',').length) {
                getCdrData(selectedReportType, selectedDatetime, false, selectedDids);
            } else {
                setLoader(false);
                $('#cdrTableView').css('width', '100%').html(`<tr><td colspan="6" style="text-align: center;color:red;"><b>${_('Please Select DIDs')}</b></td></tr>`);
                $('#toolbar-cdr').hide();
                $('.cdr_summary_wrapper').hide();
                $('#tableHeading').hide();
            }
        } else if (selectedReportType == RING_GROUP_REPORT) {
            hideAllDropDownExcept('ring_group');
            let selectedRingGroups = $('input[name="oldRingGroups"]').val();
            if (selectedRingGroups && selectedRingGroups.split(',').length) {
                getCdrData(selectedReportType, selectedDatetime, false, false, selectedRingGroups);
            } else {
                setLoader(false);
                $('#cdrTableView').css('width', '100%').html(`<tr><td colspan="6" style="text-align: center;color:red;"><b>${_('Please Select Ring Groups')}</b></td></tr>`);
                $('#toolbar-cdr').hide();
                $('.cdr_summary_wrapper').hide();
                $('#tableHeading').hide();
            }

        } else if (selectedReportType == QUEUE_REPORT) {
            hideAllDropDownExcept('queue');
            let selectedQueues = $('input[name="oldQueues"]').val();
            if (selectedQueues && selectedQueues.split(',').length) {
                getCdrData(selectedReportType, selectedDatetime, false, false, false, selectedQueues);
            } else {
                setLoader(false);
                $('#cdrTableView').css('width', '100%').html(`<tr><td colspan="6" style="text-align: center;color:red;"><b>${_('Please Select Queues')}</b></td></tr>`);
                $('#toolbar-cdr').hide();
                $('.cdr_summary_wrapper').hide();
                $('#tableHeading').hide();
            }
        } else {
            hideAllDropDownExcept();
            getCdrData(selectedReportType, selectedDatetime);

        }    

        $("#generate_schedule").click(function () {
            let reportType = $('#reportType').val();
            $('.scheduler #reportType').val(reportType).trigger('change');
            let dateTime = $('#filter_date_time').val().split(' - ');
            $('#date_time').data('daterangepicker').setStartDate(dateTime[0]);
            $('#date_time').data('daterangepicker').setEndDate(dateTime[1]);
            $('#time_period').data('daterangepicker').setStartDate(dateTime[0].split(' ')[1]);
            $('#time_period').data('daterangepicker').setEndDate(dateTime[1].split(' ')[1]);
            $('#time_period').trigger('change');

            if (reportType == EXTENSION_DETAIL_REPORT || reportType == EXTENSION_SUMMARY_REPORT) {
                let selectedExtensions = $('#extensionList').val();
                if (selectedExtensions && selectedExtensions.length) {
                    $('#modal_extension_list').val(selectedExtensions);
                    $('#modal_extension_list').multiselect("refresh");
                }
            } else if (reportType == DID_DETAIL_REPORT) {
                let selectedDids = $('#didList').val();
                if (selectedDids && selectedDids.length) {
                    $('#modal_did_list').val(selectedDids);
                    $('#modal_did_list').multiselect("refresh");
                }
            }
        });
    }

});


/**

Hides all dropdown elements in the filter container, except for the one specified by the wrapper name.
@param {string} type - The name of the wrapper to keep visible. hide all if empty
*/

function hideAllDropDownExcept(type = "") {
    let typeToWrapperMap = {'extension':'.extension_list_wrapper','did':'.did_list_wrapper','ring_group':'.ring_group_list_wrapper','queue':'.queue_list_wrapper'}; 
    for (let key in typeToWrapperMap) {
        if (key == type) {
            $('.filter_container '+ typeToWrapperMap[key]).show();
        } else {
            $('.filter_container '+ typeToWrapperMap[key]).hide();
        }
    }
}
        
function transformChart(id,chartTypes=false) {
    let chartType =(chartTypes)? chartTypes: $(`#${id}Type`).val();
    chartObj[id].transform(chartType);
}

function redirectToDetailReport(reportType) {
    let url = window.location.origin + window.location.pathname + `?display=cdrpro&view=${reportType}`;
    let datetime = getQueryParams('datetime');
    if (datetime) {
        url += `&datetime=${datetime}`;
    }
    window.location.href = url;
}

function getCdrData(reportType = false, dateRange = false, extensions = false, dids = false, ringGroups = false, queues = false, sourceNumber = '', didNumber = '') {
    setLoader(true);

    if (!dateRange) {
        dateRange = $('#filter_date_time').val();
        dateRange = moment().subtract(29, 'days').startOf('hour').format('YYYY-MM-DD 00:00:00') + " - " + moment().startOf('hour').format('YYYY-MM-DD 23:59:59')
    } else {
        dateRange = decodeURIComponent(dateRange);
    }

    if (!reportType) {
        reportType = $('select[name="reportType"]').val();
    }
    let switchview = $('input[name="switchview"]:checked').val();
    $('.graphic_export_pdf').hide();
    if ((switchview == 'widget' && reportType == ALL_CALLS_REPORT) || reportType == ALL_SUMMARY_REPORT) {

        getCallsSummary(dateRange);
        getGraphData(reportType, dateRange, false, false, 'hour', 'callsPerHour', false, false);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'reportGraph', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Outbound Calls','Internal Calls'], ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == INBOUND_REPORT){
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == OUTBOUND_REPORT){
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == INTERNAL_REPORT){
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == MISSED_REPORT){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Outbound Calls','Internal Calls'], ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
    } else if (switchview == 'widget' && reportType == ANSWERED_REPORT){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Outbound Calls','Internal Calls'], ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && (reportType == EXTENSION_DETAIL_REPORT || reportType == EXTENSION_SUMMARY_REPORT)){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Outbound Calls','Internal Calls'], ringGroups, queues);
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == DID_DETAIL_REPORT){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Internal Calls'], ringGroups, queues);
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == RING_GROUP_REPORT){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Internal Calls'], ringGroups, queues);
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == QUEUE_REPORT){
        getGraphData(reportType, dateRange, extensions, dids, '', 'callTypeChart',['Inbound Calls','Internal Calls'], ringGroups, queues);
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else if (switchview == 'widget' && reportType == INBOUND_UNIQUE_REPORT){
        getCallDispositionChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'timeIndicatorChart',['Total Calls'], ringGroups, queues);
        getDestinationTypeChart(reportType, dateRange, extensions, dids,'bar', ringGroups, queues);
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);
        getGraphData(reportType, dateRange, extensions, dids, 'hour', 'averageMesChart',['Avg RX MES', 'Avg TX MES'], ringGroups, queues);
    } else {
        if ((reportType == EXTENSION_DETAIL_REPORT || reportType == EXTENSION_SUMMARY_REPORT) && !extensions) {
            setLoader(false);
            $('#toolbar-cdr').hide();
            $('#lazyLoaderAlert').html(`<div class="alert alert-success mb-0" role="alert">
                                            <strong>${_('Please select extension')}</strong>
                                        </div>`);
            return;
        }

        if (reportType == DID_DETAIL_REPORT && !dids) {
            setLoader(false);
            $('#toolbar-cdr').hide();
            $('#lazyLoaderAlert').html(`<div class="alert alert-success mb-0" role="alert">
                                            <strong>${_('Please select did')}</strong>
                                        </div>`);
            return;
        }
        if (reportType == RING_GROUP_REPORT && !ringGroups) {
            setLoader(false);
            $('#toolbar-cdr').hide();
            $('#lazyLoaderAlert').html(`<div class="alert alert-success mb-0" role="alert">
                                            <strong>${_('Please select ring groups')}</strong>
                                        </div>`);
            return;
        }

        if (reportType == QUEUE_REPORT && !queues) {
            setLoader(false);
            $('#toolbar-cdr').hide();
            $('#lazyLoaderAlert').html(`<div class="alert alert-success mb-0" role="alert">
                                            <strong>${_('Please select queues')}</strong>
                                        </div>`);
            return;
        }
        getSingleReportCdrSummary(reportType, dateRange, extensions, dids, ringGroups, queues);

        var source = new EventSource(FreePBX.ajaxurl + `?module=cdrpro&command=getCdrData&dateRange=${dateRange}&reportType=${reportType}&sourceNumber=${sourceNumber}&didNumber=${didNumber}`, {
            withCredentials: true
        });

        let initiated = true;

        source.addEventListener("lazy-loading-cdr-data", function (event) {
            var response = JSON.parse(event.data);
            switch (response.status) {
                case 'stopped':
                    let message = '';
                    if ($('#cdrTableView').bootstrapTable('getOptions') && $('#cdrTableView').bootstrapTable('getOptions').columns && $('#cdrTableView').bootstrapTable('getOptions').columns.length) {
                        message = `<div class="alert alert-success mb-0" role="alert">
                                        <strong><i class="fa fa-check mr-1 "></i>${$('#cdrTableView').bootstrapTable('getData').length} Rows loaded successfully</strong>
                                    </div>`;
                    }
                    $('#lazyLoaderAlert').html(message)
                    // $("#lazyLoaderAlert").fadeTo(5000, 500).slideUp(500, function () {
                    //     $("#lazyLoaderAlert").slideUp(500);
                    // });
                    setLoader(false);

                    if ($('#cdrTableView').children().length == 0) {
                        $('#cdrTableView').css('width', '100%').html(`<tr><td colspan="6" style="text-align: center;"><b>${_('Data not found')}</b></td></tr>`);
                        $('#toolbar-cdr').hide();
                        $('.cdr_summary_wrapper').hide();
                        $('#tableHeading').hide();
                    }
                    break;
                case 'errored':
                    break;
                case 'running':
                    if (initiated) {
                        let keys = Object.keys(Object.assign({}, ...response.data));
                        let columns = [];
                        for (let col = 0; col < keys.length; col++) {
                            if (keys[col] != 'id' && keys[col] != 'recordingfile' && keys[col] != 'dialData' && keys[col] != 'converttotext') {
                                let colTitle = camelCaseToNormalText(keys[col]);
                                columns.push({
                                    title: colTitle,
                                    field: keys[col],
                                    sortable: true,
                                })
                            }
                        }
                        if (reportType != EXTENSION_SUMMARY_REPORT) {
                            columns.push({
                                title: 'Call Details',
                                field: '',
                                formatter: (value, row, index) => {
                                    let html = ''
                                    if (fpbx.conf.CEL_ENABLED && row.uniqueid) {
                                        html += `<i class="fa fa-info-circle" title="${_('View CEL Details')}" aria-hidden="true" onClick="viewCelDetails('${row && row.uniqueid ? row.uniqueid : ''}')"></i>`;
                                    }
                                    if (row && row.dialData==1) {
                                        html += `&nbsp;&nbsp;<i class="fa fa-phone cursor-pointer" title="${_('View Dial Details')}" aria-hidden="true" onClick="viewDialDetails('${row && row.id ? row.id : ''}','${row && row.destType ? row.destType : ''}')"></i>`;
                                    }
                                    if (row.avg_RX_MES && row.avg_TX_MES) {
                                        html += `&nbsp;&nbsp;&nbsp;<i class="fa fa-star-half-o" title="${_('View MES Details')}" aria-hidden="true" onClick="viewMesDetails('${row && row.linkedid ? row.linkedid : row.uniqueid}')"></i>`;
                                    }
                                    if (row && row.totalCalls) {
                                        html += `&nbsp;&nbsp;<i class="fa fa-eye cursor-pointer" title="${_('View Call Details')}" aria-hidden="true" onClick="viewCallDetails('${row && row.callFrom ? row.callFrom : ''}','${row && row.DID ? row.DID : ''}')"></i>`;
                                    }
                                    return html;
                                }
                            });
                        }
                        if (reportType != MISSED_REPORT && reportType != INBOUND_UNIQUE_REPORT && reportType != EXTENSION_SUMMARY_REPORT) {
                            columns.push({
                                title: 'Actions',
                                field: '',
                                formatter: (value, row, index) => {
                                    let html = ''
                                    if (row && row.recordingfile) {
                                        html += `<i class="fa fa-play cursor-pointer" title="${_('Play call recordings')}" aria-hidden="true" onClick="playRecording('${row.recordingfile}','${row.callDate}')"></i>`;
                                        html += `<i class="fa fa-download cursor-pointer" title="${_('Download call recordings')}" aria-hidden="true" onClick="callrecordingdownload(encodeURIComponent('${row.recordingfile}'),'${row.callDate}')"></i>`;

                                        if(row.converttotext !== undefined && row.converttotext !== null && row.converttotext != '') {
                                            html += '<a href="#" style="display: inline-flex;" title="Read the voice transcription" onclick="openmodal(\'' + row.converttotext + '\')"><img src="../admin/assets/scribe/images/scribe.png" width="18px" height="18px" alt="PBX Scribe" /></a>';
                                        }                                    
                                    }

                                    return html;
                                }
                            });
                        }
                        $('#lazyLoaderAlert').html(
                            `<div class="alert alert-info mb-0" role="alert">
                                    <i class="fa fa-spinner fa-spin mr-1 "></i>Please wait while we load more content. Total loaded rows :  <strong>${response.data.length}</strong>.
                            </div>`
                        )
                        $('#cdrTableView').bootstrapTable({
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
                            data: response.data,
                            checkboxEnabled: false,
                            toolbar: '#toolbar-cdr'
                        });
                        if (reportType != INBOUND_UNIQUE_REPORT) {
                            $('#cdrTableView').bootstrapTable('hideColumn', 'ringTime');
                            $('#cdrTableView').bootstrapTable('hideColumn', 'uniqueid');
                            if (reportType != MISSED_REPORT) {
                                $('#cdrTableView').bootstrapTable('hideColumn', 'talkTime');
                                $('#cdrTableView').bootstrapTable('hideColumn', 'destAnsweredBy');
                                if ($('#mes_value').val() == '1') {
                                    $('#cdrTableView').bootstrapTable('hideColumn', 'avg_RX_MES');
                                    $('#cdrTableView').bootstrapTable('hideColumn', 'avg_TX_MES');
                                }
                            }
                            $('#cdrTableView').bootstrapTable('hideColumn', 'callerIdName');
                            $('#cdrTableView').bootstrapTable('hideColumn', 'accountcode');
                            $('#cdrTableView').bootstrapTable('hideColumn', 'userfield');
                        }

                        setLoader(false);
                        initiated = false;

                    } else {
                        $('#lazyLoaderAlert').html(
                            `<div class="alert alert-info mb-0" role="alert">
                                    <i class="fa fa-spinner fa-spin mr-1 "></i>Please wait while we load more content. Total loaded rows :  <strong>${$('#cdrTableView').bootstrapTable('getData').length}</strong>.
                            </div>`)
                        $('#cdrTableView').bootstrapTable('append', response.data);
                    }
                    break;
                default:
                    break;
            }

            if (response.status !== 'running') {
                source.close();
            }
        }, false);

    }
}

function getGraphData(reportType = false, dateRange = false, extensions = false, dids = false, breakdownType = 'hour', id = false, showColumns=false, ringgroups = false, queues = false) {
    setGraphLoader(true);
    c3.chart.internal.beforeinit = function () {
        this.plugins.zoom = d3.behavior.zoom();
    };
    if (reportType && dateRange) {
        $.post("ajax.php?module=cdrpro&command=getReportBreakDownData", { reportType, dateRange, extensions, dids, breakdownType, ringgroups, queues})
            .done(function (response) {
                setGraphLoader(false);
                if (response && response.length) {
                    let xaxis = [];
                    let columns = [];
                    let fieldName = Object.keys(response[0]);

                    for (let i = 0; i < fieldName.length; i++) {
                        const field = fieldName[i];
                        if (i > 0) {
                            columns.push([camelCaseToNormalText(field)])
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

                    let dataExists = false;
                    columns.forEach(column => {
                        if (Array.isArray(column)) {
                            for (let i = 1; i < column.length; i++) {
                                if (column[i] !== 0) {
                                    dataExists = true;
                                    break;
                                }
                            }
                        } else {
                            if (column[1] !== 0) {
                                dataExists = true;
                            }
                        }
                    });
                    if (dataExists) {
                        let chartType='bar';
                        if (id == 'reportGraph') {
                            chartType = ($('#reportGraphType').val() !== null) ? $('#reportGraphType').val() : 'spline';
                        }

                        chartObj[id] = c3.generate({
                            bindto: `#${id}`,
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
                                            if (showColumns[0] == 'Avg RX MES') {
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
                        $('.graphic_export_pdf').show();
                    } else {
                        $(`#${id}`).html(` <b> ${_('Data Not Found')}</b> `);
                    }
                } else {
                    $(`#${id}`).html(` <b> ${_('Data Not Found')}</b> `)
                }
            })
            .fail(function (xhr, status, error) {
                $(`#${id}`).html(` <b> ${_('Data Not Found')}</b> `)
            });
    }
}

function getSingleReportCdrSummary(reportType = false, dateRange = false, extensions = false, dids = false, ringGroups = false, queues = false) {
    if (reportType && dateRange) {
        $.post("ajax.php?module=cdrpro&command=getSingleReportCdrSummary", { reportType, dateRange, extensions, dids, ringGroups, queues })
            .done(function (response) {
                if (response && response.totalCalls > 0) {
                    if ($('.cdr_summary_wrapper').length) {
                        $('.cdr_summary_wrapper .list-group li').each(function () {
                            let dataExists = false;
                            Object.keys(response).forEach(key => {
                                if ($(this).data('id') == key) {
                                    let value = response[key] !== null ? response[key] : 0;
                                    $(this).html(`${camelCaseToNormalText(key)} : <b>${value}</b>`);
                                    dataExists = true;
                                }
                            }, this)
                            if (!dataExists) {
                                $(this).hide();
                            }
                        });
                        $('.cdr_summary_wrapper').show();
                    } else if ($('.cdr_header_summary_wrapper').length) {
                        $('.cdr_header_summary_wrapper .data-tile').each(function () {
                            Object.keys(response).forEach(key => {
                                if ($(this).find(`span#${key}`).length) {
                                    $(`#${key}`).html(`<span>${response[key] ? response[key] : '--'}</span>`);
                                    $(this).show();
                                }
                            }, this)
                        });
                        if (reportType == DID_DETAIL_REPORT) {
                            showSelectedData(dids, 'Selected DIDs');
                        }
                        if (reportType == EXTENSION_DETAIL_REPORT || reportType == EXTENSION_SUMMARY_REPORT) {
                            showSelectedData(extensions, 'Selected Extensions');
                        }
                        if (reportType == RING_GROUP_REPORT) {
                            showSelectedData(ringGroups, 'Selected Ring Groups');
                        }
                        if (reportType == QUEUE_REPORT) {
                            showSelectedData(queues, 'Selected Queues');
                        }
                        $('.cdr_header_summary_wrapper').show();
                    }
                } else {
                    $('.cdr_summary_wrapper').hide();
                    $('.cdr_header_summary_wrapper').hide();
                }
            }).fail(function (xhr, status, error) {
                $('.cdr_summary_wrapper .list-group li').each(function () {
                    $(this).hide();
                });
            });
    }
}
function viewMesDetails(uniqueid) {
    $('#detailModal .modal-title').html(`${_('MES Details')}`);
    $('#detailModal .modal-body').html(`<table id="MesTableView"></table>`);
    $('#MesTableView').bootstrapTable('destroy')
    if (uniqueid) {
        $.post("ajax.php?module=cdrpro&command=getMesByUniqueid", { uniqueid: uniqueid })
            .done(function (response) {
                if (response.status) {
                    if (response.data && response.data.length > 0) {
                        let keys = Object.keys(Object.assign({}, ...response.data));
                        let columns = [];
                        for (let col = 0; col < keys.length; col++) {
                            columns.push({
                                title: camelCaseToNormalText(keys[col]),
                                field: keys[col],
                                sortable: true,
                            })
                        }
                        $('#MesTableView').bootstrapTable({
                            striped: true,
                            pagination: false,
                            showColumns: true,
                            showToggle: false,
                            showExport: true,
                            sortable: false,
                            search: false,
                            pageSize: 10,
                            pageList: [10, 25, 50, 100, 500],
                            columns: columns,
                            data: response.data,
                            checkboxEnabled: false
                        });
                    } else {
						$('#MesTableView').bootstrapTable({
                            striped: true,
                            pagination: true,
                            showColumns: true,
                            showToggle: true,
                            showExport: true,
                            sortable: true,
                            search: true,
                            pageSize: 25,
                            pageList: [10, 25, 50, 100, 500],
                            columns: [],
                            data: [],
                            checkboxEnabled: false
                        });
                        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
                    }
                } else {
                    fpbxToast(_(response.message), _('Error'), 'error');
                    $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
                }
                $('#detailModal').modal('show');
            })
            .fail(function (xhr, status, error) {
                fpbxToast(_(error), _('Error'), "error");
            });
    } else {
        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
        $('#detailModal').modal('show');
    }
}

function showSelectedData(data, label) {
    if (data) {
        $('.selected-entries .card-body p').html(`${label} : <span>${data.replace(/,/g, ', ')}</span>`);
        $('.selected-entries').show();
    } else {
        $('.selected-entries .card-body p').html(``);
        $('.selected-entries').hide();
    }

}

function viewCelDetails(uniqueid) {
    $('#detailModal .modal-title').html(`${_('CEL Details')}`);
    $('#detailModal .modal-body').html(`<table id="celTableView"></table>`);
    $('#celTableView').bootstrapTable('destroy')
    if (uniqueid) {
        $.post("ajax.php?module=cdrpro&command=getCelByUniqueid", { uniqueid: uniqueid })
            .done(function (response) {
                if (response.status) {
                    if (response.data && response.data.length > 0) {
                        let keys = Object.keys(Object.assign({}, ...response.data));
                        let columns = [];
                        for (let col = 0; col < keys.length; col++) {
                            columns.push({
                                title: camelCaseToNormalText(keys[col]),
                                field: keys[col],
                                sortable: true,
                            })
                        }
						$('#celTableView').bootstrapTable({
                            striped: true,
                            pagination: true,
                            showColumns: true,
                            showToggle: true,
                            showExport: true,
                            sortable: true,
                            search: true,
                            pageSize: 25,
                            pageList: [10, 25, 50, 100, 500],
                            columns: columns,
                            data: response.data,
                            checkboxEnabled: false
                        });
                    } else {

                        $('#celTableView').bootstrapTable({
                            striped: true,
                            pagination: true,
                            showColumns: true,
                            showToggle: true,
                            showExport: true,
                            sortable: true,
                            search: true,
                            pageSize: 25,
                            pageList: [10, 25, 50, 100, 500],
                            columns: [],
                            data: [],
                            checkboxEnabled: false
                        });
                        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
                    }
                } else {
                    fpbxToast(_(response.message), _('Error'), 'error');
                    $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
                }
                $('#detailModal').modal('show');
            })
            .fail(function (xhr, status, error) {
                fpbxToast(_(error), _('Error'), "error");
            });
    } else {
        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
        $('#detailModal').modal('show');
    }
}

function viewDialDetails(id,destType) {
    $('#detailModal .modal-title').html(`${_('Dial Details')}`);
    $('#detailModal .modal-body').html(``);
    if (id) {
        $.post("ajax.php?module=cdrpro&command=getDialDetailsById", { id: id })
            .done(function (response) {
                if (response.status) {
                    if (response.data && typeof response.data == 'object') {
                        switch (destType) {
							case 'Paging':
                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Paging Devices</th>
                                                                                 <th style="border-top: 1px solid rgba(94,156,125,0.9);">Name</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Duration</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Billsec</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);

                                // Extract keys and values from the object and store them in arrays
                                var roomNumbers = Object.keys(response.data);
                                var rows = [];
                                roomNumbers.forEach(function (roomNumber) {
                                    var items = response.data[roomNumber];
                                       var row = "<tr><td><B> "+roomNumber+"</B><td>" + items.clid + "</td><td>" + items.duration + "</td><td>" + items.billsec + "</td></tr>";
                                        rows.push(row);
                                });
                                $('#detailModal .modal-body #table-body').html(rows.join(""));
                                break;
                            case 'Conference':
                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Member Number</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Joined With Members</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Name</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Duration</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Billsec</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);

                                // Extract keys and values from the object and store them in arrays
                                var roomNumbers = Object.keys(response.data);
                                var rows = [];

                                roomNumbers.forEach(function (roomNumber) {
                                    var items = response.data[roomNumber];
                                    var rowSpan = Object.keys(items).length;
                                    Object.keys(items).forEach(function (key, index) {
                                        var item = items[key];
                                        var roomNumberCell = index === 0 ? "<td rowspan='" + rowSpan + "' class='center-align' ><b>" + roomNumber + "</b></td>" : "";
                                        var numCell = item.num !== null ? item.num : "Alone in the conf";
                                        var nameCell = item.name !== null ? item.name : "";
                                        var row = "<tr>"+roomNumberCell+"<td>" + numCell + "</td><td>" + nameCell + "</td><td>" + item.duration + "</td><td>" + item.billsec + "</td></tr>";
                                        rows.push(row);
                                        roomNumber ='';
                                    });
                                });

                                $('#detailModal .modal-body #table-body').html(rows.join(""));
                                break;
							case 'IntercomConfBridge':
                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">calldate</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">src</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">dst</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Dcontext</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Channel</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">duration</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">billsec</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">disposition</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);

                               let intercomDetails = "";
                               response.data.forEach((item) => {
                                const row = `<tr>
                                  <td>${item.calldate}</td>
                                  <td>${item.src}</td>
                                  <td>${item.dst}</td>
                                  <td>${item.dcontext}</td>
                                  <td>${item.channel}</td>
                                  <td>${item.duration}</td>
                                  <td>${item.billsec}</td>
                                  <td>${item.disposition}</td>
                                </tr>`;
                              
                                intercomDetails += row; // Append the row to the 'test' variable
                               });
                                $('#detailModal .modal-body #table-body').html(intercomDetails);
                             
                                break;
                            case 'Queue':
                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Extension</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Call Date</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Channel</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">DST Channel</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">Context</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">Disposition</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">Uniqueid</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);

                                // Get the keys of the object
                                const keys = Object.keys(response.data);

                                // Get the table body element
                                let tableBody = "";

                                // Loop through the keys and populate the table rows dynamically
                                keys.forEach((key) => {
                                    response.data[key].forEach((item) => {
                                        const row = `<tr>
                                                        <td>${key}</td>
                                                        <td>${item.calldate}</td>
                                                        <td>${item.channel}</td>
														<td>${item.dstchannel}</td>
														<td>${item.context}</td>
														<td>${item.disposition}</td>
														<td>${item.uniqueid}</td>
                                                    </tr>`;
                                        tableBody += row;
                                    });
                                });

                                $('#detailModal .modal-body #table-body').html(tableBody);
                                break;
                                case 'FMFM':
                                    $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th style="border-top: 1px solid rgba(94,156,125,0.9);">Call Time</th>
                                                                                    <th style="border-top: 1px solid rgba(94,156,125,0.9);">Call Status</th>
                                                                                    <th style="border-top: 1px solid rgba(94,156,125,0.9);">Dialed</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody id="table-body">
                                                                            </tbody>
                                                                        </table>`);
    
                                    // Get the keys of the object
                                    const fmkeys = Object.keys(response.data);
    
                                    // Get the table body element
                                    let FMtableBody = "";
    
                                    // Loop through the keys and populate the table rows dynamically
                                    fmkeys.forEach((key) => {
                                        response.data[key].forEach((item) => {
                                            const row = `<tr>
                                                            <td>${item.calldate}</td>
                                                            <td>${item.status}</td>
                                                            <td>${item.channel}</td>
                                                        </tr>`;
                                            FMtableBody += row;
                                        });
                                    });
    
                                    $('#detailModal .modal-body #table-body').html(FMtableBody);
                                    break;
                            case 'Internal':
                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Call Date</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Dial</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);
                            
                                // Loop through each object in the JSON response.data
                                $.each(response.data, function (key, value) {
                                    // Loop through each item in the object
                                    $.each(value, function (index, item) {
                                        // Create a new table row and populate it with the item's data
                                        var row = $("<tr><td>" + item.calldate + "</td><td>" + item.dial + "</td></tr>");
                                        // Append the row to the table's body
                                        $('#detailModal .modal-body #table-body').html(row);
                                    });
                                });

                                break;
                            case 'RingGroup':

                                $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Extension</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Call Date</th>
                                                                                <th style="border-top: 1px solid rgba(94,156,125,0.9);">Channel</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">Dstchannel</th>
																				<th style="border-top: 1px solid rgba(94,156,125,0.9);">Disposition</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="table-body">
                                                                        </tbody>
                                                                    </table>`);

                                // Loop through the JavaScript object and create a new row in the table for each element
                                for (var i in response.data) {
                                    if (response.data.hasOwnProperty(i)) {
                                        var obj = response.data[i];
                                        for (var j = 0; j < obj.length; j++) {
                                            var row = "<tr>";
                                            row += "<td>" + i + "</td>";
                                            row += "<td>" + obj[j].calldate + "</td>";
                                            row += "<td>" + obj[j].channel + "</td>";
											row += "<td>" + obj[j].dstchannel + "</td>";
											row += "<td>" + obj[j].disposition + "</td>";
                                            row += "</tr>";
                                            $("#detailModal .modal-body #table-body").append(row);
                                        }
                                    }
                                }
                                break;
                            default:
                                const objkeys = Object.keys(response.data);
                                let appendRows = tableheader = headerRow = "";
                                objkeys.forEach((key) => {
                                    response.data[key].forEach((item) => {
                                        appendRows += `<tr>`;
                                        Object.entries(item).forEach(([itemKey, itemValue]) => {
                                            if (!tableheader) {
                                                headerRow += `<th style="border-top: 1px solid rgba(94,156,125,0.9);">${itemKey}</th>`;
                                            }
                                            appendRows += `<td>${itemValue}</td>`;
                                        });
                                        appendRows += `</tr>`;
                                        if (!tableheader) {
                                            tableheader = `<thead><tr>${headerRow}</tr></thead>`;
                                        }
                                    });
                                });
                                if(appendRows) {
                                    $('#detailModal .modal-body').html(`<table class="table table-bordered">${tableheader}
                                    <tbody id="table-body">
                                    </tbody>
                                </table>`);
                                $('#detailModal .modal-body #table-body').html(appendRows);

                                }else {
                                    $('#detailModal .modal-body').html(`<table class="table table-bordered">
                                                                        <tr><td colspan="10" class="text-center">${_('Data not found')}</td></tr>
                                                                    </table>`);
                                }
                                break;
                        }
                    } else {
                        $('#detailModal .modal-body').html(`<p>${_('Data not found')}</p>`);
                    }
                } else {
                    fpbxToast(_(response.message), _('Error'), 'error');
                    $('#detailModal .modal-body').html(`<p>${_('Data not found')}</p>`);
                }
                $('#detailModal').modal('show');
            })
            .fail(function (xhr, status, error) {
                fpbxToast(_(error), _('Error'), "error");
            });
    } else {
        $('#detailModal .modal-body').html(`<p>${_('Data not found')}</p>`);
        $('#detailModal').modal('show');
    }
}

function viewCallDetails(sourceNumber, didNumber) {
    $('#detailModal .modal-title').html(`${_('Call Details')}`);
    $('#detailModal .modal-body').html(`<table id="callTableView"></table>`);
    $('#callTableView').bootstrapTable('destroy');
    let selectedReportType = INBOUND_REPORT;
    let selectedDatetime = $('input[name="oldDatetime"]').val();
    let eventName = 'lazy-loading-unique-cdr-data';
    if (sourceNumber && didNumber) {
        let source = new EventSource(FreePBX.ajaxurl + `?module=cdrpro&command=getCdrData&dateRange=${selectedDatetime}&reportType=${selectedReportType}&sourceNumber=${sourceNumber}&didNumber=${didNumber}&eventName=${eventName}`, {
            withCredentials: true
        });

        let initiated = true;

        source.addEventListener(eventName, function (event) {
            let response = JSON.parse(event.data);
            switch (response.status) {
                case 'stopped':
                    $('#detailModal').modal('show');
                    if ($('#callTableView').children().length == 0) {
                        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
                    }
                    break;
                case 'errored':
                    break;
                case 'running':
                    if (initiated) {
                        let keys = Object.keys(Object.assign({}, ...response.data));
                        let columns = [];
                        for (let col = 0; col < keys.length; col++) {
                            if (keys[col] != 'id' && keys[col] != 'recordingfile' && keys[col] != 'dialData') {
                                let colTitle = camelCaseToNormalText(keys[col]);
                                let splittedKey = keys[col].split(" ");
                                if (splittedKey[1] == '(DID)') {
                                    colTitle = camelCaseToNormalText(splittedKey[0]);
                                    colTitle += splittedKey[1];
                                }
                                if (keys[col] == 'DID') {
                                    colTitle = keys[col];
                                }
                                columns.push({
                                    title: colTitle,
                                    field: keys[col],
                                    sortable: true,
                                })
                            }
                        }
                        $('#callTableView').bootstrapTable({
                            striped: true,
                            pagination: true,
                            showColumns: true,
                            showToggle: true,
                            sortable: true,
                            search: true,
                            pageSize: 10,
                            pageList: [10, 25, 50, 100],
                            columns: columns,
                            data: response.data,
                            checkboxEnabled: false
                        });

                        initiated = false;

                    } else {
                        $('#callTableView').bootstrapTable('append', response.data);
                    }
                    break;
                default:
                    break;
            }

            if (response.status !== 'running') {
                source.close();
            }
        }, false);
    } else {
        $('#detailModal .modal-body p').html(`<b>${_('Data not found')}`);
        $('#detailModal').modal('show');
    }
}

function playRecording(fileName, calldate) {
    var dateObj = new Date(calldate);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    month = ('0' + month).slice(-2)
    var day = dateObj.getUTCDate();
    day = ('0' + day).slice(-2)
    var year = dateObj.getUTCFullYear();

    $('#detailModal .modal-title').html(`${_('Recordings')}`);
    $('#detailModal .modal-body').html(``);

    let player = '<div id="jquery_jplayer" class="jp-jplayer" data-container="#jp_container" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '" data-file="' + encodeURIComponent(fileName) + '"></div><div id="jp_container" data-player="jquery_jplayer" class="jp-audio-freepbx" role="application" aria-label="media player">' +
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
    $('#detailModal .modal-body').html(player);
    $('#detailModal').modal('show');
    bindPlayers();
}

function callrecordingdownload(fileName, calldate) {
    window.open(`ajax.php?module=cdrpro&command=callrecordingdownload&file=${fileName}`);
}

function bindPlayers() {
    $(".jp-jplayer").each(function () {
        var container = $(this).data("container"),
            player = $(this),
            file = $(this).data("file"),
            year = $(this).data("year"),
            month = $(this).data("month"),
            day = $(this).data("day");
        $(this).jPlayer({
            ready: function () {
                $(container + " .jp-play").click(function () {
                    if (!player.data("jPlayer").status.srcSet) {
                        $(container).addClass("jp-state-loading");
                        $.ajax({
                            type: 'POST',
                            url: "ajax.php",
                            data: { module: "cdrpro", command: "gethtml5", file: file, year: year, month: month, day: day },
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

function setGraphLoader(show = false) {
    if (show) {
        $('.graph-loader').show();
        $('#reportGraph').hide();
    } else {
        $('.graph-loader').hide();
        $('#reportGraph').show();
    }
}

function getCallsSummary(dateRange) {
    setGraphLoader(true);
    $.get(FreePBX.ajaxurl + `?module=cdrpro&command=getAllCdrSummary&dateRange=${dateRange}`, function (response) {
        if (response.status) {
            setGraphLoader(false);
            Object.keys(response.data).forEach(key => {
                $(`#${key}`).html(`<span>${response.data[key] ? response.data[key] : '--'}</span>`);
            });
        } else {
            if (response.message) {
                fpbxToast(_(response.message), _('Error'), 'error');
            }
        }
    });
}

function exportData() {
    let reportType = $('select[name="reportType"]').val();
    let datetime = $('#filter_date_time').val();
    let extensions = $('#extensionList').val().join(',');
    let dids = $('#didList').val().join(',');
    let ringGroups = $('#ringGroupList').val().join(',');
    let queues = $('#queueList').val().join(',');
    let exportType = $('#exportType').val();
    if (exportType == 'pdf') {
        let cdrData = $('#cdrTableView').bootstrapTable('getData').length;
        if (cdrData > 70000) {
            fpbxConfirm(
                sprintf(_('Exporting %s CDR records as PDF may take a considerable amount of time. We suggest using alternative export formats for large datasets to expedite the process. Are you sure that you want to proceed with PDF export?'), cdrData),
                _("Yes"), _("No"),
                function () {
                    window.open(`ajax.php?module=cdrpro&command=exportCdrData&reporttype=${reportType}&datetime=${datetime}&format=${exportType}`);
                }
            );
        } else {
            window.open(`ajax.php?module=cdrpro&command=exportCdrData&reporttype=${reportType}&datetime=${datetime}&format=${exportType}`);
        }
    } else {
        window.open(`ajax.php?module=cdrpro&command=exportCdrData&reporttype=${reportType}&datetime=${datetime}&format=${exportType}`);
    }
}

$(".filter_container").submit(function (e) {
    e.preventDefault();
    let reportType = $('select[name="reportType"]').val();
    let datetime = $('#filter_date_time').val();
    let extensions = $('#extensionList').val().join(',');
    let dids = $('#didList').val().join(',');
    let ringGroups = $('#ringGroupList').val().join(',');
    let queues = $('#queueList').val().join(',');
    let switchview = $('input[name="switchview"]:checked').val();

    if (reportType == EXTENSION_DETAIL_REPORT || reportType == EXTENSION_SUMMARY_REPORT) {
        if (!extensions) {
            fpbxToast(_("Please select extensions"), _('Error'), 'error');
            return false;
        }
    }

    if (reportType == DID_DETAIL_REPORT) {
        if (!dids) {
            fpbxToast(_("Please select DID's"), _('Error'), 'error');
            return false;
        }
    }
    if (reportType == RING_GROUP_REPORT) {
        if (!ringGroups) {
            fpbxToast(_("Please select Ring Groups"), _('Error'), 'error');
            return false;
        }
    }

    if (reportType == QUEUE_REPORT) {
        if (!queues) {
            fpbxToast(_("Please select Queues"), _('Error'), 'error');
            return false;
        }
    }
    if (!datetime) {
        fpbxToast(_("Please select date"), _('Error'), 'error');
    }
    updateQueryParamsInUrl('view', reportType);
    updateQueryParamsInUrl('datetime', datetime);
    updateQueryParamsInUrl('switchview', switchview);
    e.currentTarget.submit();
});

$("#switchviewwidget").change(function () {
    $(".filter_container").submit();
});

$("#switchviewdetail").change(function () {
    $(".filter_container").submit();
});

$("#bulkdelete").click(function () {
    var chosen = $('#scheduleReport').bootstrapTable("getSelections");
    fpbxConfirm(
        sprintf(_('Are you sure you wish to delete %s scheduled reports'), chosen.length),
        _("Yes"), _("No"),
        function () {
            $.post("ajax.php?module=cdrpro&command=bulkDeleteScheduledReportById", { schedulereports: chosen })
                .done(function (response) {
                    if (response.status) {
                        $('#scheduleReport').bootstrapTable('refresh');
                        fpbxToast(_(response.message));
                    } else {
                        fpbxToast(_(response.message), _('Error'), 'error');
                    }
                })
                .fail(function (xhr, status, error) {
                    fpbxToast(_(error), _('Error'), "error");
                });
        }
    );
})

$('#filestoreLocation').change(function () {
    if ($('#filestoreLocation').val().length > 0) {
        $('#note').show();
    } else {
        $('#note').hide();
    }
});

$('#reportType').change(function () {
    if ($(this).val() == EXTENSION_DETAIL_REPORT || $(this).val() == EXTENSION_SUMMARY_REPORT) {
        hideAllDropDownExcept('extension');
    } else if ($(this).val() == DID_DETAIL_REPORT) {
        hideAllDropDownExcept('did');
    } else if ($(this).val() == RING_GROUP_REPORT) {
        hideAllDropDownExcept('ring_group');
    } else if ($(this).val() == QUEUE_REPORT) {
        hideAllDropDownExcept('queue');
    } else {
        hideAllDropDownExcept('none');
    }
})

$('#breakdownBy').change(function () {
    let breakdownType = $(this).val()
    let extensions = $('#extensionList').val();
    let dids = $('#didList').val();
    let ringgroups = $('#ringGroupList').val();
    let queues = $('#queueList').val();
    let reportType = $('#reportType').val();
    let dateRange = $('#filter_date_time').val();
    getGraphData(reportType, dateRange, extensions, dids, breakdownType, 'reportGraph', ringgroups, queues);
})

$("#export_pdf").click(function () {
    var pdf = new jsPDF();
    var startX = 10;
    var startY = 35;
    var rowHeight = 10;
    var margin = 5;
    var rowIndex = 0;
    pdf.setFontSize(18);
    var reportHeading = $.trim($('.heading').text());
    let date = $.trim($('#filter_date_time').val());
    pdf.text(20, 15, reportHeading+"\n");
    pdf.setFontSize(14);
    pdf.text(20, 30, "Date Range: " + date);
    pdf.setFontSize(14);
    var listItems = document.querySelectorAll('.list-group-item');
    if(listItems.length >0) {
        for (var i = 0; i < listItems.length; i++) {
            var listItem = listItems[i];
            var text = listItem.textContent.trim();
            if (text) {
                var xPos = startX + 1 * 10;
                var yPos = startY +  rowIndex * rowHeight;
                pdf.rect(xPos, yPos, 80, rowHeight, "S");
                pdf.text(xPos + margin, yPos + margin + 4, text);
                rowIndex++; 
            }
        }
    }else {
        $('.report_category_card').each(function() {
            var pText = $.trim($(this).find('.card-title').text());
            var spanText = $.trim($(this).find('.card-text > span:first-child').text());
            if(spanText) {
                var xPos = startX + 1 * 10;
                var yPos = startY +  rowIndex * rowHeight;
                pdf.rect(xPos, yPos, 110, rowHeight, "S");
                pdf.text(xPos + margin, yPos + margin + 4, pText+" : "+spanText);
                rowIndex++;
            }
          });
    }
    pdf.addPage();
    $('.c3').each(function(index) {
        let key =this.id;
        const svgElement = document.querySelector(`#${key} svg`);
        var svgXml = new XMLSerializer().serializeToString(svgElement);
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 850;
        canvas.height = 650;
        var img = document.createElement('img');
        img.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(svgXml));
        img.onload = function () {
            context.drawImage(img, 0, 60, 750, 550);
            if (index != 0) {
                pdf.addPage();
            }
            let repName = camelCaseToNormalText(key);
            pdf.setFontSize(14);
            pdf.text(50, 10, repName);
            pdf.setFontSize(10);
            pdf.text(50, 15, "Date Range: " + date);
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0)
        };
    });
    setTimeout(() => {
        pdf.save('Graph-reports.pdf');
    }, 3000);

});

function getCallDispositionChart(reportType,dateRange,extensions, dids,chartType='bar', ringGroups, queues) {
    setGraphLoader(true);
    $.get(FreePBX.ajaxurl + `?module=cdrpro&command=getCallDispositionChart&dateRange=${dateRange}&reportType=${reportType}&extensions=${extensions}&dids=${dids}&ringgroups=${ringGroups}&queues=${queues}`, function (response) {
        if (response.status) {
            setGraphLoader(false);
            if (response.data.length > 0) {
                let xaxis = [];
                let totalSum = 0;
                const columns = response.data.map(item => {
                   totalSum += parseInt(item.totalCalls);
                   return [item.disposition, parseInt(item.totalCalls)]
                });
                xaxis.push(totalSum);
                chartObj['callDispositionChart'] = c3.generate({
                    bindto: '#callDispositionChart',
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
                $(`#callDispositionChart`).html(` <b> ${_('Data Not Found')}</b> `);
            }
        } else {
            if (response.message) {
                fpbxToast(_(response.message), _('Error'), 'error');
            }
        }
    });
}

function getDestinationTypeChart(reportType,dateRange,extensions, dids,chartType='bar', ringGroups, queues) {
    setGraphLoader(true);
    $.get(FreePBX.ajaxurl + `?module=cdrpro&command=getDestinationTypeChart&dateRange=${dateRange}&reportType=${reportType}&extensions=${extensions}&dids=${dids}&ringgroups=${ringGroups}&queues=${queues}`, function (response) {
        if (response.status) {
            setGraphLoader(false);
            if (response.data.length > 0) {
                let xaxis = [];
                let totalSum = 0;
                const columns = response.data.map(item => {
                    totalSum += parseInt(item.totalCalls);
                    return [item.call_type, parseInt(item.totalCalls)]
                });
                xaxis.push(totalSum);
                chartObj['destinationTypeChart'] = c3.generate({
                    bindto: '#destinationTypeChart',
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
                $(`#destinationTypeChart`).html(` <b> ${_('Data Not Found')}</b> `);
            }
        } else {
            if (response.message) {
                fpbxToast(_(response.message), _('Error'), 'error');
            }
        }
    });
}

$('.calendarIcon').click(function(){
    $("#filter_date_time").click();
});

function openmodal(turl) {
    var result = $.ajax({
        url: turl,
        type: 'POST',
        async: false
    });
    result = JSON.parse(result.responseText);
    
    $("#addtionalcontent").html(result.html);
    $("#addtionalcontent").appendTo("body");
    $("#datamodal").modal('show');
}

function closemodal() {
	$('div#addtionalcontent:not(:first)').remove();
	$("#addtionalcontent").html("");
	$("#datamodal").hide();
    $(".modal-backdrop").remove();
    $("body").css("overflow", "visible");
}
