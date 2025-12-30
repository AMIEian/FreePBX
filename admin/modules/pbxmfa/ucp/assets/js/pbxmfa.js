function generateBackupCodes() {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=generateBackupCodes", {}, function (res) {
        if (res.status) {
            UCP.showAlert(res.message, 'success');
            /*
            * Make CSV downloadable
            */
            let csvContent = "data:text/csv;charset=utf-8,"
                + res.recoveryCodes.join(",");

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `recovery-code.csv`);
            document.body.appendChild(link);
            link.click();
            displayBackupCodes();

        } else {
            UCP.showAlert(res.message, 'error');
        }
    });
};

function downloadBackupCodes() {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=getBackupCodes", {}, function (res) {
        if (res.status) {
            UCP.showAlert(res.message, 'success');
            /*
            * Make CSV downloadable
            */
            let csvContent = "data:text/csv;charset=utf-8,"
                + res.recoveryCodes.join(",");

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `recovery-code.csv`);
            document.body.appendChild(link);
            link.click();

        } else {
            UCP.showAlert(res.message, 'error');
        }
    });
}

function deleteBackupCodes() {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=deleteBackupCodes", {}, function (res) {
        if (res.status) {
            UCP.showAlert(res.message, 'success');
        } else {
            UCP.showAlert(res.message, 'error');
        }
        displayBackupCodes();
    });
}

function displayBackupCodes() {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=getBackupCodes", {}, function (res) {
        if (res.status) {
            if (res.recoveryCodes && res.recoveryCodes.length > 0) {
                let backupCodes = splitArr(res.recoveryCodes);
                $('#backupCodes').empty('');
                let codeDiv = `<div class="row">`;
                for (let i = 0; i < backupCodes.length; i++) {
                    const codes = backupCodes[i];
                    codeDiv += `<div class="col-xs-6">
                                    <ul class="list-group">`;
                    for (let j = 0; j < codes.length; j++) {
                        codeDiv += `<li class="list-group-item">${codes[j]}</li>`
                    }
                    codeDiv += `</ul">
                                </div>`;
                }
                codeDiv += `</div>
                                <div class="backup__actions">
                                    <div>
                                        <button type="button" class="btn btn-primary generate-backup-code mr-1" onclick="generateBackupCodes()">
                                            <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Regenerate
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" class="btn btn-primary download-backup-code mr-1" onclick="downloadBackupCodes()">
                                            <i class="fa fa-download mr-1" aria-hidden="true"></i> Download
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" class="btn btn-danger delete-backup-code" onclick="deleteBackupCodes()">
                                            <i class="fa fa-trash mr-1" aria-hidden="true"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            `;
                $('#backupCodes').html(codeDiv);
            } else {
                $('#backupCodes').empty();
                $('#backupCodes').html(`<button type="button" class="btn btn-primary generate-backup-code" onclick="generateBackupCodes()">
                                            <i class="fa fa-plus" aria-hidden="true"></i> Create Backup Codes
                                        </button>`);
            }
        } else {
            $('#backupCodes').empty();
            $('#backupCodes').html(`<button type="button" class="btn btn-primary generate-backup-code" onclick="generateBackupCodes()">
                                        <i class="fa fa-plus" aria-hidden="true"></i> Create Backup Codes
                                    </button>`);
        }
    });
}

function splitArr(arr2) {
    var arr1 = arr2.splice(0, Math.floor(arr2.length / 2))
    return [arr2, arr1];
}

function resetUserMFA() {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=resetUserMFA", {}, function (res) {
        if (res.status) {
            displayBackupCodes();
            $('.reset__wrapper').html(`
                <div class="alert alert-success mb-3">
                    <b>
                        <p class="mb-0">${_(res.message)}.</p>
                        <p class="mb-0">${_('Old backup codes have been deleted. You will no longer be able to use backup codes that are saved and are currently used for authentication.')} <b>${_('Please generate a new backup codes.')}</b></p>
                        <p class="mb-0">${_('If you have previously configured the authenticator app, then you will receive the authenticator app configuration mail again the next time you sign in.')}</p>
                    </b>
                </div>
            `)
        } else {
            UCP.showAlert(res.message, 'error');
        }
    });
}