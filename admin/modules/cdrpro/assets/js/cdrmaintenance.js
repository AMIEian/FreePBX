
$('[name="archiveStatus"]').change(function () {
    toggle_archivesettings();
});
$('#settings').on('submit', function (e) {
    if ($('#archiveStatusyes').is(':checked')) {
        if ($("#archiveLimit").val().length === 0) {
            return warnInvalid($("#archiveLimit"), _("Invalid archive limit specified"));
        }
        if ($("#alert_email").val().length === 0) {
            return warnInvalid($("#alert_email"), _("Invalid reminder email specified"));
        }
        if ($("#from_email").val().length === 0) {
            return warnInvalid($("#from_email"), _("Invalid from email specified"));
        }
    }
});
function toggle_archivesettings() {
    if ($('#archiveStatusyes').is(':checked')) {
        $(".archiveSettings").slideDown();
    } else {
        $(".archiveSettings").slideUp();
    }
}
$('#filestoreLocation').change(function () {
    if ($('#filestoreLocation').val().length > 0) {
        $('#note').show();
    } else {
        $('#note').hide();
    }
});
//init storage multiselect
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

function openDeleteModal(backupName) {
    $('#deleteForm').modal('show');
    $('#modalTitle').text(`Delete ${backupName} ?`);
    $('#backupName').val(backupName);
}

function submitDeleteForm() {
    let value = $('#confirmDelete').val();
    value = value.toLowerCase();
    if (value != 'delete') {
        return warnInvalid($("#delete"), _("Invalid confirmation text. Please enter DELETE to confirm"));
    }
    let backupName = $('#backupName').val();
    $.post(window.FreePBX.ajaxurl, {
        module: 'cdrpro',
        command: 'deleteBackup',
        backupName: backupName,
    }, function (data) {
        alert(_(data.message));
        $("#deleteForm").modal('hide');
        window.location.reload();
    });
};