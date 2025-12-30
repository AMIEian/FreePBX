$(function () {

    
    $('input[name="dateTime"]').daterangepicker({
        locale: {
            format: 'YYYY-MM-DD'
        },
        maxSpan: {
            year: 1
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

    $('input[name="timePeriod"]').daterangepicker({
        timePicker: true,
        timePickerSeconds: true,
        locale: {
            format: 'HH:mm:ss'
        }
    }).on('show.daterangepicker', function (ev, picker) {
        picker.container.find(".calendar-table").hide();
    });

    $('#schedulerPreview').bootstrapTable({
        striped: true,
        columns: previewCols,
        data: []
    });

    let page = getQueryParams('display');
    let view = getQueryParams('view');

    if (page == 'cdrscheduler' && view == 'form') {

        /** INITIALISE EXENSION MULTISELECT  */
        if ($("#extensionList").length) {
            $('#extensionList').multiselect({
                disableIfEmpty: true,
                disabledText: _('No Extensions Found'),
                enableFiltering: true,
                includeSelectAllOption: true,
                buttonWidth: '80%',
                enableLazyLoad: true,
                nonSelectedText: 'Select Extension'
            });
            //get items
            $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getExtensions`)
                .done(
                    function (data) {
                        $('#extensionList').multiselect('dataprovider', data);
                    }
                )
                .fail(
                    function (jqxhr, textStatus, error) {
                        $('#extensionList').multiselect('dataprovider', {});
                    }
                );
        }

        /** INITIALISE DID MULTISELECT  */
        if ($("#didList").length) {
            $('#didList').multiselect({
                disableIfEmpty: true,
                disabledText: _('No Dids Found'),
                enableFiltering: true,
                includeSelectAllOption: true,
                buttonWidth: '80%',
                enableLazyLoad: true,
                nonSelectedText: 'Select DID'
            });
            //get items
            $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getDIDs`)
                .done(
                    function (data) {
                        $('#didList').multiselect('dataprovider', data);
                    }
                )
                .fail(
                    function (jqxhr, textStatus, error) {
                        $('#didList').multiselect('dataprovider', {});
                    }
                );
        }

        getSchedulerPreviewDetails();

        $('.filterByCol').change(function () {
            let fields = $(this).parent().siblings();
            if ($(this).val() != "none") {
                $(fields[0]).show()
                $(fields[1]).hide()
            } else {
                $(fields[0]).hide()
                $(fields[1]).hide()
            }
        })

        $('.filterByOperator').change(function () {
            let fields = $(this).parent().siblings();
            if ($(this).val() != "none" && $(this).val() != "notempty" && $(this).val() != "empty") {
                $(fields[1]).show()
            } else {
                $(fields[1]).hide()
            }
        });

        $('#reportFields').multiselect({
            disableIfEmpty: true,
            disabledText: _('No Fields'),
            includeSelectAllOption: true,
            enableFiltering: true,
            includeSelectAllOption: true,
            buttonWidth: '80%',
            enableLazyLoad: true
        });

        //get items
        $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=getNewCdrColumns`)
            .done(
                function (data) {
                    $('#reportFields').multiselect('dataprovider', data);
                }
            )
            .fail(
                function (jqxhr, textStatus, error) {
                    $('#reportFields').multiselect('dataprovider', {});
                }
        );

        let selectedExtensions = $('input[name="oldExtensions"]').val();
        if (selectedExtensions && selectedExtensions.split(',').length) {
            setTimeout(() => {
                $('#extensionList').val(selectedExtensions.split(','));
                $('#extensionList').multiselect("refresh");
            }, 1000);
        }

        let selectedDids = $('input[name="oldDids"]').val();
        if (selectedDids && selectedDids.split(',').length) {
            setTimeout(() => {
                $('#didList').val(selectedDids.split(','));
                $('#didList').multiselect("refresh");
            }, 1000);
        }
    }

});

function handleFilterByHideAndShow(params) {
    $('.filterByCol').each(function () {
        let fields = $(this).parent().siblings();
        if ($(this).val() != "none") {
            $(fields[0]).show()
            $(fields[1]).hide()
        } else {
            $(fields[0]).hide()
            $(fields[1]).hide()
        }
        $(this).change(function () {
            let fields = $(this).parent().siblings();
            if ($(this).val() != "none") {
                $(fields[0]).show()
                $(fields[1]).hide()
            } else {
                $(fields[0]).hide()
                $(fields[1]).hide()
            }
        })
    });

    $('.filterByOperator').each(function () {
        let fields = $(this).parent().siblings();
        if ($(this).val() != "none" && $(this).val() != "notempty" && $(this).val() != "empty") {
            $(fields[1]).show()
        } else {
            $(fields[1]).hide()
        }
        $(this).change(function () {
            let fields = $(this).parent().siblings();
            if ($(this).val() != "none" && $(this).val() != "notempty" && $(this).val() != "empty") {
                $(fields[1]).show()
            } else {
                $(fields[1]).hide()
            }
        })
    });

    $('.delete').click(function () {
        $(this).parent().parent().remove();
        handleFilterByHideAndShow();
    })

}

function addFilter() {
    $(".filters .row:last").clone().appendTo(".filters");
    let i = 0;
    $('.filter_action_btns').each(function () {
        if (i == 0) {
            $(this).find('.add').show();
            $(this).find('.delete').hide();
        } else {
            $(this).find('.add').hide();
            $(this).find('.delete').show();
        }
        i++;
    });
    handleFilterByHideAndShow();
}

function getSchedulerPreviewDetails() {
    let occurenceType = $('#reportOccurance').val();
    let dateTime = $('#date_time').val();
    let timePeriod = $('#time_period').val();
    $.post("ajax.php?module=cdrpro&command=getSchedulePreview", { occurenceType: occurenceType, dateTime: dateTime, timePeriod: timePeriod }, function (response) {
        if (response.status) {
            $('#schedulerPreview').bootstrapTable('destroy').bootstrapTable({
                striped: true,
                columns: previewCols,
                data: response.previewDates
            });
        } else {
            fpbxToast(_(response.message), _('Error'), 'error');
        }
    });
}

function userSchedulerActions(value, row, index) {

    var html = `
                <a href="?display=cdrscheduler&view=form&scheduleid=${row.id}"><i class="fa fa-pencil cursor-pointer" title="${_('Edit')}" aria-hidden="true" ></i></a>
                <i class="fa fa-trash cursor-pointer" title="${_('Delete')}" aria-hidden="true" onClick="deleteScheduledReportById('${row.id}')"></i>
                <i class="fa fa-play cursor-pointer" id="run_report_${row.id}" title="${_('Run')}" aria-hidden="true" onClick="runScheduledReport('${row.id}')"></i>
                <i class="fa fa-spinner fa-spin hidden" id="report_loader_${row.id}"></i>
            `;
    return html;

}

function deleteScheduledReportById(id) {
    fpbxConfirm(
        sprintf(_('Are you sure you wish to delete this scheduled report')),
        _("Yes"), _("No"),
        function () {
                $.post("ajax.php?module=cdrpro&command=deleteScheduledReportById", { scheduleid: id }, function (response) {
                    if (response.status) {
                        $('#scheduleReport').bootstrapTable('refresh');
                        fpbxToast(_(response.message));
                    } else {
                        fpbxToast(_(response.message), _('Error'), 'error');
                    }
                });
        });
}

function runScheduledReport(id) {
    $('#run_report_' + id).addClass('hidden');
    $('#report_loader_' + id).removeClass('hidden');
    $.post("ajax.php?module=cdrpro&command=runScheduledReport", { scheduleid: id }, function (response) {
        $('#run_report_' + id).removeClass('hidden');
        $('#report_loader_' + id).addClass('hidden');
        if (response.status) {
            fpbxToast(_(response.message));
        } else {
            fpbxToast(_(response.message), _('Error'), 'error');
        }
    });

}

function formatSchedulerDate(date) {
    const dt = new Date(date);
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    return `${padL(dt.getFullYear())}-${dt.getMonth() + 1}-${padL(dt.getDate())} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`;
}

$('#reportOccurance').change(function () {
    if ($(this).val() == 'once') {
        $('.dateTimeContainer').show()
    } else {
        $('.dateTimeContainer').hide()
    }
    getSchedulerPreviewDetails();
})

$('#date_time').change(function () {
    getSchedulerPreviewDetails();
});

$('#time_period').change(function () {
    $('#time_frame').text($(this).val());
    getSchedulerPreviewDetails();
});

$(".schedule_report_btn").click(function (e) {
    $(`.element-container`).each(function () {
        if ($(this).hasClass('has-error')) {
            $(this).removeClass('has-error');
        }
    })

    if (!$("#cdrfile_storage option:selected").val()) {
        alert(_("No storage location selected for Backup. Please select atleast one storage location to save the backup"));
        return false;
     }

    let formData = $('.scheduler').serializeObject();
    if (formData['extensionList[]']) {
        formData.extensions = (typeof formData['extensionList[]'] == 'string') ? formData['extensionList[]'] : formData['extensionList[]'].join(',');
    }
    if (formData['didList[]']) {
        formData.dids = (typeof formData['didList[]'] == 'string') ? formData['didList[]'] : formData['didList[]'].join(',');
    }
    formData.modalDateTime = $('#date_time').val();
    $.post("ajax.php?module=cdrpro&command=upsertReportSchedule", formData, function (response) {
        if (response.status) {
            fpbxToast(_(response.message));
            if ($('#generate_schedule_modal').length) {
                $('#generate_schedule_modal').modal('hide');
                $('#reportName').val('');
                $('#emailTo').val('');
            } else {
                window.location.href = '/admin/config.php?display=cdrscheduler';
            }
        } else {
            if (response.validationErrors && response.errors) {
                Object.keys(response.errors).forEach(key => {
                    if (!$(`.${key}Container`).hasClass('has-error')) {
                        $(`.${key}Container`).addClass('has-error')
                    }
                })
            }
            fpbxToast(_(response.message), _('Error'), 'error');
        }
    });
});

$('.scheduler #reportType').change(function (e) {
    if ($(this).val() == 'extensiondetail' || $(this).val() == 'extensionsummary') {
        $('.extension_container').show();
        $('.did_container').hide();
    } else if ($(this).val() == 'diddetail') {
        $('.extension_container').hide();
        $('.did_container').show();
    } else {
        $('.extension_container').hide();
        $('.did_container').hide();
    }
});

$('#reportName').on('keyup', function() {
    $.post("ajax.php?module=cdrpro&command=checkReportName", { reportName: $(this).val(), scheduleId: $('#schedule_id').val() }, function (response) {
        if (response.status) {
            $('.schedule_report_btn').prop('disabled', false);
            $('.report-name-error').empty();
            $('.reportNameContainer').removeClass('has-error');
            $('.report-name-error').slideUp(200);
        } else {
            $('.schedule_report_btn').prop('disabled', true);
            $('.report-name-error').text(response.message);
            $('.reportNameContainer').addClass('has-error');
            $('.report-name-error').slideDown(200);
        }
    });
});

$('#submitEmailSettings button[type=submit]').on('click', function (e) {
	e.preventDefault();

	let emailType = $('input[name="notificationEmailType"]:checked').val();

	var formData = new FormData();
	formData.append('emailType', emailType);
	formData.append('subject', $('input[name="notificationEmailSubject"]').val().trim());
	if (emailType == 'text') {
		formData.append('body', $('#notificationTextEmailBody').val());
	} else {
		formData.append('body', $('#notificationHtmlEmailBody').Editor('getText'));
	}

	$.ajax({
		type: "POST",
		enctype: 'multipart/form-data',
		url: sprintf("%s?module=cdrpro&command=saveEmailSettings", window.FreePBX.ajaxurl),
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
		success: function (data) {
			if (data.status) {
				fpbxToast(_(data.message));
			} else {
				fpbxToast(_(data.message), _('Error'), 'error');
			}
		},
		error: function (data) {
			fpbxToast(_('There was an error updating setting'), _('Error'), 'error');
		}
	});

});

if ($("#cdrfile_storage").length) {
    var schedule_id = $('#schedule_id').val();
    if (schedule_id !== undefined && schedule_id !== null && schedule_id !== "") {
        schedule_id='&schedule_id='+schedule_id; 
    } else { schedule_id =''; }
    $('#cdrfile_storage').multiselect({
        disableIfEmpty: true,
        disabledText: _('No Storage Locations'),
        enableFiltering: true,
        includeSelectAllOption: true,
        buttonWidth: '80%',
        enableLazyLoad: true
    });
    //get items
    $.getJSON(`${FreePBX.ajaxurl}?module=cdrpro&command=storageList`+schedule_id)
        .done(
            function (data) {
                $('#cdrfile_storage').multiselect('dataprovider', data);
            }
        )
        .fail(
            function (jqxhr, textStatus, error) {
                $('#cdrfile_storage').multiselect('dataprovider', {});
            }
        );
}

$(document).ready(function () {
    $('.scheduler #reportType').change();
});