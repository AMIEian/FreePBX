/**
 * function to define table actions
 * @method enableMFA
 */
function userActions(value, row, index) {
    var html = '';
    if (row.isMFAEnabled == 'yes') {
        // If User Type is ucp then pass uid
        html = `
            <i class="fa fa-check-circle text-success cursor-pointer" aria-hidden="true" onClick="handleEnableMFAForUsersModal('${row.username}','${row.usermail}','${row.extension}','${row.authtype}','${row.usertype}','${row.isMFAEnabled}',${row.modifyUser},'${row.uid ? row.uid : false}')" title="Click here to disable MFA"></i>
        `;
    } else {
        // If User Type is ucp then pass uid
        html = `
            <i class="fa fa-times-circle text-danger cursor-pointer" aria-hidden="true" onClick="handleEnableMFAForUsersModal('${row.username}','${row.usermail}','${row.extension}','${row.authtype}','${row.usertype}','${row.isMFAEnabled}',${row.modifyUser},'${row.uid ? row.uid : false}')" title="Click here to enable MFA"></i>
        `;
    }
    return html;
}

function userBackupCodeActions(value, row, index) {

    var html = "";
    if (row.isMFAEnabled == 'yes') {
        if (row.hasBackupCodes == 'yes') {
            html = `
                <i class="fa fa-refresh cursor-pointer" title="${_('Regenerate new set of backup codes')}" aria-hidden="true" onClick="handleBackupCode('refresh','${row.username}','${row.usertype}')"></i>
                <i class="fa fa-trash cursor-pointer" title="${_('Delete backup codes')}" aria-hidden="true" onClick="handleBackupCode('delete','${row.username}','${row.usertype}')"></i>
                <i class="fa fa-download cursor-pointer" title="${_('Download backup codes')}" aria-hidden="true" onClick="downloadBackupCodes('${row.username}','${row.usertype}')"></i>
            `;
        } else {
            html = `
                <i class="fa fa-plus cursor-pointer" title="${_('Create backup codes')}" aria-hidden="true" onClick="generateBackupCodes('${row.username}','${row.usertype}')"></i>
            `;
        }
    } else {
        html = `
                ---
            `;
    }
    return html;

}

function resetUserAuthSettings(value, row, index) {
    var html = '';
    if (row.isMFAEnabled == 'yes') {
        html = `<i class="fa fa-refresh cursor-pointer" aria-hidden="true" title="${_('Reset MFA')}" onClick="openResetMFAConfirmationModal('${row.username}','${row.usertype}')" aria-hidden="true"></i>`;
    } else {
        html = ` --- `;
    }
    return html;
}

function openResetMFAConfirmationModal(username, usertype) {
    $('#resetMFAConfirmationModal').modal('show');
    $('#resetMFAConfirmationModalLabel').text(`Reset MFA for ${username}`);
    $('#resetMFAConfirmationModal .modal-body').html(`
        <p><b>${_('You are resetting Multi-Factor Authentication for this user. They will no longer be able to use recovery codes that they have saved and are currently used for authentication.')}</b></p>
        <p><b>${_('After resetting user has to regenerate new backup codes. If this user has previously configured the authenticator app, then they will receive the authenticator app configuration mail again the next time they sign in.')}</b></p>
    `);
    $('#resetMFAConfirmationModal .modal-footer').html(`
        <button type="button" class="btn btn-secondary" onClick="closeMFAModal()" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-danger" onClick="resetMFA('${username}','${usertype}')">Reset MFA</button>
    `);
}

function closeResetMfaModal() {
    $('#resetMFAConfirmationModal').modal('hide');
    $('#resetMFAConfirmationModalLabel').text(``);
    $('#resetMFAConfirmationModal .modal-body').html(``);
    $('#resetMFAConfirmationModal .modal-footer').html(``);
}

function resetMFA(username, usertype) {
    let data = {
        username: username,
        usertype: usertype
    };
    $.post("ajax.php?module=pbxmfa&command=resetUserMFA", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
            $('#adminUsersTable').bootstrapTable('refresh');
            $('#ucpUsersTable').bootstrapTable('refresh');
            $('#resetMFAConfirmationModal').modal('hide');
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
            $('#resetMFAConfirmationModal').modal('hide');
        }
    });
}

/**
 * function to enable MFA
 * @method enableMFA
 */
function handleEnableMFAForUsersModal(username, usermail, extension, authtype, usertype, isMFAEnabled, modifyUser, uid = false) {
    $('#systemWideEnableOrDisableConfirmationModal').modal('hide');
    let mfaType = authtype ? authtype : $('input[name=oldTypeOfMFA]').val();
    $('#username').val(username);
    $('#usermail').val(usermail);
    if (extension) {
        $('#userExtension').val(extension);
    } else {
        $('#userExtension').val('default');
    }
    $('#authtype').val(mfaType);
    $('#usertype').val(usertype);
    $('#uid').val(uid);
    if (isMFAEnabled == 'yes') {
        // User Requested to disable
        $('#isMFAEnabled').val('no');
        $('#usermailWrapper').hide();
        $('#extensionWrapper').hide();
        $('#disableMessageDiv').html(
            `<div id="disableMessageDiv">
                    <p><b>Are you sure you want to disable MFA ?</b></p>
                </div>`
        ).show();
        $('#enableMFAModalLabel').text(`Disable MFA for ${username}`);
        $('#updateMFAButton').text('Disable MFA').removeClass().addClass('btn btn-danger').show();
    } else {
        // User Requested to enable
        $('#isMFAEnabled').val('yes');
        $('#disableMessageDiv').hide();
        if (mfaType == 'all') {
            if (usertype == 'ucp' || usertype == 'both') {
                $('#extensionWrapper').hide();
                $('#usermailWrapper').hide();
                let fieldToBeChecked = '';
                if (usermail == '' || usermail == null || usermail == undefined) {
                    fieldToBeChecked += 'email address';
                }
                if (extension == '' || extension == null || extension == undefined) {
                    fieldToBeChecked += fieldToBeChecked ? " and " : "";
                    fieldToBeChecked += 'extension';
                }
                if (fieldToBeChecked) {
                    if (!modifyUser) {
                        let message = '';
                        message = `<b>Kindly associate ${fieldToBeChecked} to this user's account in Active Directory and perform a synchronization of the AD. Once completed, please proceed to enable Multi-Factor Authentication (MFA) for the user.</b>`;
                        $('#disableMessageDiv').html(
                            `<b>${message}</b>`
                        ).show();
                    } else {
                        $('#disableMessageDiv').html(
                            `<b>Please link the ${fieldToBeChecked} to this user from <a href="/admin/config.php?display=userman#users" target="_blank">userman</a> before enabling MFA</b>`
                        ).show();
                    }
                    $('#updateMFAButton').hide();
                } else {
                    if (modifyUser) {
                        $('#usermailWrapper').show();
                    } else {
                        $('#usermailWrapper').hide();
                        $('#disableMessageDiv').html(
                            `<div id="disableMessageDiv">
                            <p><b>Are you sure you want to enable MFA ?</b></p>
                        </div>`
                        ).show();
                    }
                    $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
                }
            } else {
                $('#extensionWrapper').show();
                $('#usermailWrapper').show();
                $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
            }
        } else if (mfaType == 'app' || mfaType == 'email') {
            if (usertype == 'ucp' || usertype == 'both') {
                $('#extensionWrapper').hide();
                $('#usermailWrapper').hide();
                if ((usermail == '' || usermail == null || usermail == undefined)) {
                    if (!modifyUser) {
                        $('#disableMessageDiv').html(
                            `<b>${_("Kindly associate an email address with this user's account in Active Directory and perform a synchronization of the AD. Once completed, please proceed to enable Multi-Factor Authentication (MFA) for the user")}</b>`
                        ).show();
                    } else {
                        $('#disableMessageDiv').html(
                            `<b>Please link the usermail to this user from <a href="/admin/config.php?display=userman#users" target="_blank">userman</a> before enabling MFA</b>`
                        ).show();
                    }
                    $('#updateMFAButton').hide();
                } else {
                    $('#disableMessageDiv').html(
                        `<div id="disableMessageDiv">
                            <p><b>Are you sure you want to enable MFA ?</b></p>
                        </div>`
                    ).show();
                    $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
                }
            } else {
                $('#usermailWrapper').show();
                $('#extensionWrapper').hide();
                $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
            }
        } else {
            if ((usertype == 'ucp' && mfaType == 'call') || (usertype == 'both' && mfaType == 'call')) {
                $('#extensionWrapper').hide();
                if (extension == '' || extension == null || extension == undefined) {
                    $('#disableMessageDiv').html(
                        `<b>Please link the extension to this user from <a href="/admin/config.php?display=userman#users" target="_blank">userman</a> before enabling MFA</b>`
                    ).show();
                    $('#updateMFAButton').hide();
                } else {
                    $('#disableMessageDiv').html(
                        `<b>Are you sure you wish to enable MFA for ${username}</b>`
                    ).show();
                    $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
                }
            } else {
                $('#extensionWrapper').show();
                $('#updateMFAButton').text('Enable MFA').removeClass().addClass('btn btn-success').show();
            }
            $('#usermailWrapper').hide();
        }
        $('#enableMFAModalLabel').text(`Enable MFA for ${username}`);
    }
    $('#enableMFAModal').modal('show');
}

function handleBackupCode(action, username, usertype) {
    if (action == 'refresh') {
        $('#backupCodeActionsConfirmationModal .modal-content').empty();
        $('#backupCodeActionsConfirmationModal .modal-content').html(`
            <div class="modal-header d-flex ">
                <h5 class="modal-title mr-auto">Refresh Backup Codes</h5>
            </div>
            <div class="modal-body">
                <div>
                    <p><b>${_('Are you sure you want to refresh backup codes')} ?</b></p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">${_('Close')}</button>
                <button type="button" class="btn btn-success" onClick="generateBackupCodes('${username}','${usertype}')">Refresh</button>
            </div>
        `)
    } else {
        $('#backupCodeActionsConfirmationModal .modal-content').empty();
        $('#backupCodeActionsConfirmationModal .modal-content').html(`
            <div class="modal-header d-flex ">
                <h5 class="modal-title mr-auto">Delete Backup Codes</h5>
            </div>
            <div class="modal-body">
                <div>
                    <p><b>${_('Are you sure you want to delete backup codes')} ?</b></p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">${_('Close')}</button>
                <button type="button" class="btn btn-danger" onClick="deleteBackupCodes('${username}','${usertype}')">Delete</button>
            </div>
        `)
    }
    $('#backupCodeActionsConfirmationModal').modal('show');
}

function generateBackupCodes(username, usertype) {
    $('#backupCodeActionsConfirmationModal').modal("hide");
    let data = {
        username: username,
        usertype: usertype
    };
    $.post("ajax.php?module=pbxmfa&command=generateBackupCodes", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
            $('#adminUsersTable').bootstrapTable('refresh');
            $('#ucpUsersTable').bootstrapTable('refresh');
            /*
            * Make CSV downloadable
            */
            let csvContent = "data:text/csv;charset=utf-8,"
                + res.recoveryCodes.join(",");

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${username}-recovery-code.csv`);
            document.body.appendChild(link);
            link.click();

        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

function deleteBackupCodes(username, usertype) {
    $('#backupCodeActionsConfirmationModal').modal("hide");
    let data = {
        username: username,
        usertype: usertype
    };
    $.post("ajax.php?module=pbxmfa&command=deleteBackupCodes", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
            $('#adminUsersTable').bootstrapTable('refresh');
            $('#ucpUsersTable').bootstrapTable('refresh');
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

function downloadBackupCodes(username, usertype) {

    let data = {
        username: username,
        usertype: usertype
    };
    $.post("ajax.php?module=pbxmfa&command=downloadBackupCodes", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
            /*
            * Make CSV downloadable
            */
            let csvContent = "data:text/csv;charset=utf-8,"
                + res.recoveryCodes.join(",");

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${username}-recovery-code.csv`);
            document.body.appendChild(link);
            link.click();

        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}


/**
 * function to reset modal
 * @method closeMFAModal
 */
function closeMFAModal() {
    $('#username').val('');
    $('#usermail').val('');
    $('#userExtension').val('');
    $('#authtype').val('');
    $('#usertype').val('');
    $('#isMFAEnabled').val('');
    $('#enableMFAModal').modal('hide');
}

function enableOrDisableMFAForUser() {

    let data = {};
    data.username = $('#username').val();
    data.usermail = $('#usermail').val();
    data.extension = $('#userExtension').val();
    data.authtype = $('#authtype').val();
    data.usertype = $('#usertype').val();
    data.uid = $('#uid').val();
    data.usertype = $('#usertype').val();
    data.isMFAEnabled = $('#isMFAEnabled').val() == 'yes' ? 1 : 0;

    if (data.isMFAEnabled == 'yes' && ((data.authtype == 'app' || data.authtype == 'email' || data.authtype == 'all') && (data.usermail == '' || data.usermail == null || data.usermail == undefined))) {
        fpbxToast(_("Please enter user email address!"), _('Error'), 'error');
        return;
    }

    if (data.isMFAEnabled == 'yes' && ((data.authtype == 'call' || data.authtype == 'all') && (data.extension == '' || data.extension == null || data.extension == undefined))) {
        fpbxToast(_("Please enter extension"), _('Error'), 'error');
        return;
    }

    if (data.isMFAEnabled == 'yes' && (data.authtype == 'call' || data.authtype == 'all') && (data.extension == '' || data.extension == null || data.extension == undefined || isNaN(data.extension))) {
        fpbxToast(_("Please enter valid extension"), _('Error'), 'error');
        return;
    }

    $.post("ajax.php?module=pbxmfa&command=enableOrDisableMFAForUser", data, function (res) {
        if (res.status) {
            closeMFAModal();
            $('#adminUsersTable').bootstrapTable('refresh');
            getUserLimitDetails();
            $('#ucpUsersTable').bootstrapTable('refresh');
            fpbxToast(_(res.message));
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });

}

$(document).ready(function () {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    $('.switch input').change(function () {

        if (($(this).attr('id') == 'emailAuth') && ($(this).prop('checked') == true)) {
            $('#emailWrapper').removeClass('hidden');
        } else {
            $('#emailWrapper').addClass('hidden');
        }

    });

    $('#admin > div > div.bootstrap-table > div.fixed-table-toolbar > div.columns.columns-right.btn-group.pull-right > button').click(function () {
        getUserLimitDetails();
    })

    $('#ucp > div > div.bootstrap-table > div.fixed-table-toolbar > div.columns.columns-right.btn-group.pull-right > button').click(function () {
        getUserLimitDetails();
    })
})

function handleTypeOfUsers() {
    if ($('input[name=typeOfUsers]:checked').val() == 'admin') {
        $('#adminTabContent').show().addClass('active');
        $('#adminTab').show().addClass('active');
        $('#ucpTab').hide();
        $('#ucpTabContent').hide();
    } else if ($('input[name=typeOfUsers]:checked').val() == 'ucp') {
        $('#adminTabContent').hide();
        $('#adminTab').hide();
        $('#ucpTab').show().addClass('active');
        $('#ucpTabContent').show().addClass('active');
    } else if ($('input[name=typeOfUsers]:checked').val() == 'both') {
        $('#adminTabContent').show().addClass('active');
        $('#adminTab').show().addClass('active');
        $('#ucpTab').show().removeClass('active');
        $('#ucpTabContent').hide();
    } else {
        $('#adminTabContent').hide();
        $('#adminTab').hide();
        $('#ucpTab').hide();
        $('#ucpTabContent').hide();
    }
}

function handleMFA() {
    if ($('input[name=enableMFA]').prop('checked') && $('input[name=isMFAEnabledOnDB]').val() == '1') {
        $('#typeOfUsers').show();
        $('#typeOfMFA').show();
        handleTypeOfUsers();
    } else {
        $('#typeOfUsers').hide();
        $('#typeOfMFA').hide();
        $('#adminTabContent').hide();
        $('#adminTab').hide();
        $('#ucpTab').hide();
        $('#ucpTabContent').hide();
    }

    if (!$('input[name=enableMFA]').prop('checked')) {
        $('#systemWideEnableOrDisableConfirmationModal').modal('show');
    } else {
        if ($('input[name=isMFAEnabledOnDB]').val() == '0') {

            showMailFuncationalityTestModal();

        } else {
            $('#systemWideEnableOrDisableConfirmationModal').modal('hide');
        }
    }
    handleSettingsSubmitBtn();
}

function sendTestMail() {
    let testmail = $('#testmail').val().trim();

    if (testmail == '' || testmail == null || testmail == undefined) {
        fpbxToast(_("Please enter user email address!"), _('Error'), 'error');
        return;
    }

    let data = {
        testmail: testmail
    };
    $.post("ajax.php?module=pbxmfa&command=sendTestMail", data, function (res) {
        if (res.status) {
            $('#otpWrapper').show();
            $('#systemWideEnableOrDisableConfirmationModal .modal-footer').html(`
                <div class="d-flex p-0">
                    <span class='mr-auto'><span id="timertext"></span>&nbsp;<span id="timer"></span></span>
                    <button type="button" class="btn btn-sm btn-primary" onclick="verifyTestMailOtp()">Verify OTP</button>
                    <button type="button" class="btn btn-sm btn-primary" onclick="skipTest()">Skip Test</button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="ignoreEnableOrDisableMFA()" data-dismiss="modal">Close</button>
                </div>
            `);
            setTimeout(() => {
                stopCount();
                $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
                timer(20, 'otp'); // In Seconds
            }, 300);
            fpbxToast(_(res.message));
        } else {
            $('#otpWrapper').hide();
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

function makeTestCall() {
    let testExtension = $('#testExtension').val().trim();

    if (testExtension == '' || testExtension == null || testExtension == undefined) {
        fpbxToast(_("Please enter extension!"), _('Error'), 'error');
        return;
    }

    let data = {
        testExtension: testExtension
    };
    $.post("ajax.php?module=pbxmfa&command=makeTestCall", data, function (res) {
        if (res.status) {
            $('#systemWideEnableOrDisableConfirmationModal .modal-footer').html(`
                <div class="d-flex p-0">
                    <span class='mr-auto'><span id="timertext"></span>&nbsp;<span id="timer"></span></span>
                    <button type="button" class="btn btn-secondary" onclick="ignoreEnableOrDisableMFA()" data-dismiss="modal">Close</button>
                </div>
            `);
            $('.call__status').html(`
                <div class="alert alert-info mt-2">
                    ${_("Please wait we are calling.. Answer the call and press # to validate call functionality.")}
                </div>
            `);
            setTimeout(() => {
                stopCount();
                $("#timertext").html('Request call again in').fadeIn("slow", "swing");
                timer(20, 'call'); // In Seconds
            }, 300);
            getTestCallStatus(res.testCallId)
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

function getTestCallStatus(testCallId) {

    $.post("/admin/ajax.php?module=pbxmfa&command=getTestCallStatus",
        {
            testCallId: testCallId
        }
    ).done(function (response) {

        if (response.status) {

            if (response.callstatus == CALL_STATUS.SUCCESS) {

                if (response.isauthenticated) {

                    $('#mfaSettingsForm').submit();

                } else {

                    $('.call__status').html(`
                        <div class="alert alert-danger mt-2">
                            ${_(`Something went wrong. Please try again..!!`)}
                        </div>    
                    `);

                }

            } else if (response.callstatus == CALL_STATUS.INITIATED) {

                setTimeout(() => {

                    getTestCallStatus(testCallId);

                }, 1000);

            } else if (response.callstatus == CALL_STATUS.INVALID) {

                $('.call__status').html(`
                    <div class="alert alert-danger mt-2">
                        ${_(`Received invalid response. Please try again..!!`)}
                    </div>    
                `);

            } else if (response.callstatus == CALL_STATUS.NOANSWER) {

                $('.call__status').html(`
                    <div class="alert alert-danger mt-2">
                        ${_(`No answer. Please try again..!!`)}
                    </div>    
                `);

            } else if (response.callstatus == CALL_STATUS.TIMEOUT) {

                $('.call__status').html(`
                    <div class="alert alert-danger mt-2">
                        ${_(`Call timeout. Please try again..!!`)}
                    </div>    
                `);

            } else if (response.callstatus == CALL_STATUS.UNAVAILABLE) {

                $('.call__status').html(`
                    <div class="alert alert-danger mt-2">
                        ${_(`Extension number is unavailable or not valid. Please try again..!!`)}
                    </div>
                `);

            } else {

                $('.call__status').html(`
                    <div class="alert alert-danger mt-2">
                        ${response.message ? _("Not able to make call. " + response.message) : _(`Not able to make call. Please try again..!!`)}
                    </div>
                `);

            }
        } else {

            $('.call__status').html(`
                <div class="alert alert-danger mt-2">
                    ${_(`Not able to make call. Please try again..!!`)}
                </div>    
            `);

        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), "error");
    });
}

function verifyTestMailOtp() {
    let otp = $('#otp').val().trim();
    let testmail = $('#testmail').val().trim();
    let data = {
        otp: otp,
        testmail: testmail
    };
    $.post("ajax.php?module=pbxmfa&command=verifyTestMailOtp", data, function (res) {
        if (res.status) {
            $('#mfaSettingsForm').submit();
            fpbxToast(_(res.message));
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

$('#ucpTab').click(function () {
    $('#adminTabContent').hide().removeClass('active');
    $('#ucpTabContent').show().addClass('active');
})

$('#adminTab').click(function () {
    $('#ucpTabContent').hide().removeClass('active');
    $('#adminTabContent').show().addClass('active');
})

$(document).on('click', "button.btn-mfa-enable", function () {
    let authType = $('input[name=typeOfMFA]:checked').val();
    var section = $(this).attr('data-section');
    var chosen = $(`#${section}UsersTable`).bootstrapTable("getSelections");
    let fieldToBeChecked = "";
    let invalidUserCount = 0;
    let usersToBeEnabled = [];
    if (authType == 'app' || authType == 'email') {
        Object.keys(chosen).forEach(key => {
            if (chosen[key].isMFAEnabled == 'no' && chosen[key]['usermail'] != '') {
                usersToBeEnabled.push(chosen[key]);
            }
            if (chosen[key]['usermail'] == '') {
                invalidUserCount++;
            }
        });
        if (invalidUserCount > 0) {
            fieldToBeChecked = 'email';
        }
    } else if (authType == 'call') {
        Object.keys(chosen).forEach(key => {
            if (chosen[key].isMFAEnabled == 'no' && chosen[key]['extension'] != '') {
                usersToBeEnabled.push(chosen[key]);
            }
            if (chosen[key]['extension'] == '') {
                invalidUserCount++;
            }
        });
        if (invalidUserCount > 0) {
            fieldToBeChecked = 'extension';
        }
    } else if (authType == 'all') {
        let invalidEmail = false;
        let invalidExtension = false;
        Object.keys(chosen).forEach(key => {
            if (chosen[key].isMFAEnabled == 'no' && chosen[key]['extension'] != '' && chosen[key]['usermail'] != '') {
                usersToBeEnabled.push(chosen[key]);
            }
            if (chosen[key]['extension'] == '' || chosen[key]['usermail'] == '') {
                invalidUserCount++;
                if (chosen[key]['usermail'] == '')
                    invalidEmail = true;
                if (chosen[key]['extension'] == '')
                    invalidExtension = true;
            }
        });
        if (invalidUserCount > 0) {
            fieldToBeChecked = invalidEmail && !invalidExtension ? 'email' : (!invalidEmail && invalidExtension ? 'extension' : (invalidEmail && invalidExtension ? 'email and extension' : ""));
        }
    }

    usersToBeEnabled = usersToBeEnabled.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.username === value.username && t.usertype === value.usertype
        ))
    )

    let invalidUsersMessage = "";
    if (chosen.length) {
        if (invalidUserCount > 0) {
            invalidUsersMessage = sprintf(_('Please add %s to enable MFA for %susers'), fieldToBeChecked ? fieldToBeChecked : "Email address and Extension", usersToBeEnabled.length > 0 ? `other ${invalidUserCount} ` : "");
        }
    }
    if (usersToBeEnabled.length > 0) {
        fpbxConfirm(
            sprintf(_(`Are you sure you wish to enable MFA for selected users?`)),
            _("Yes"), _("No"),
            function () {
                $(`#enable-${section}`).find("span").text(_("Enabling..."));
                $(`#enable-${section}`).prop("disabled", true);
                $(`#disable-${section}`).prop("disabled", true);
                $.post("ajax.php?module=pbxmfa&command=bulkEnableOrDisableMfa", { data: usersToBeEnabled, requestToEnable: true }, function (data) {
                    if (data.status) {
                        let mgs = sprintf(_('MFA is not enabled for %s users. Please check the log for more info.'), invalidUserCount)
                        if (invalidUserCount > 0) {
                            fpbxToast(_(data.message + `. ${mgs}`), _('Error'), 'error');
                        } else {
                            fpbxToast(_(data.message));
                        }
                    } else {
                        fpbxToast(data.message, _('Error'), 'error');
                    }
                    $(`#enable-${section}`).find("span").text(_("Enable"));
                    $(`#${section}UsersTable`).bootstrapTable('refresh');
                    getUserLimitDetails();
                });
            }
        );
    } else {
        if (invalidUserCount > 0) {
            fpbxToast(invalidUsersMessage, _('Error'), 'error')
        }
    }
});

$(document).on('click', "button.btn-mfa-disable", function () {
    var section = $(this).attr('data-section');
    var chosen = $(`#${section}UsersTable`).bootstrapTable("getSelections");
    let userCount = 0;
    let usersToBedisabled = [];
    Object.keys(chosen).forEach(key => {
        if (chosen[key].isMFAEnabled == 'yes') {
            userCount++;
            usersToBedisabled.push(chosen[key]);
        }
    })
    if (userCount > 0) {
        fpbxConfirm(
            sprintf(_("Are you sure you wish to disable MFA for %s users?"), userCount),
            _("Yes"), _("No"),
            function () {
                $(`#disable-${section}`).find("span").text(_("Disabling..."));
                $(`#disable-${section}`).prop("disabled", true);
                $(`#enable-${section}`).prop("disabled", true);
                $.post("ajax.php?module=pbxmfa&command=bulkEnableOrDisableMfa", { data: usersToBedisabled, requestToEnable: false }, function (data) {
                    if (data.status) {
                        fpbxToast(_(data.message));
                    } else {
                        fpbxToast(data.message, '', 'error');
                    }
                    $(`#disable-${section}`).find("span").text(_("Disable"));
                    $(`#${section}UsersTable`).bootstrapTable('refresh');
                    getUserLimitDetails();
                });
            }
        );
    } else {
        if (chosen.length) {
            fpbxToast(_('MFA is already disabled for the select users'));
        }
    }
});

$("#adminUsersTable").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table load-success.bs.table load-error.bs.table', function () {
    var chosenCount = $(`#adminUsersTable`).bootstrapTable("getSelections").length;
    if (chosenCount > 0) {
        $('#enable-admin').prop("disabled", false);
        $('#disable-admin').prop("disabled", false);
    } else {
        $('#enable-admin').prop("disabled", true);
        $('#disable-admin').prop("disabled", true);
    }
});


$("#ucpUsersTable").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table load-success.bs.table load-error.bs.table', function () {
    var chosenCount = $(`#ucpUsersTable`).bootstrapTable("getSelections").length;
    if (chosenCount > 0) {
        $('#enable-ucp').prop("disabled", false);
        $('#disable-ucp').prop("disabled", false);
    } else {
        $('#enable-ucp').prop("disabled", true);
        $('#disable-ucp').prop("disabled", true);
    }
});

function sendQRCodeViaEmail(username, usermail, authtype, usertype, isMFAEnabled) {
    let data = {
        username: username,
        usermail: usermail,
        authtype: authtype,
        usertype: usertype,
    };
    $.post("ajax.php?module=pbxmfa&command=sendQRCodeViaEmail", data, function (res) {
        if (res.status) {
            fpbxToast(_(res.message));
        } else {
            fpbxToast(_(res.message), _('Error'), 'error');
        }
    });
}

$('#disableSystemWideMFA').click(function () {
    $('#submitMfaSettings button').trigger("click");
})

function ignoreEnableOrDisableMFA() {
    if ($('input[name=isMFAEnabledOnDB]').val() == '1') {
        $('#enableMFA1').prop("checked", true);
        $('#enableMFA0').prop("checked", false);
    } else {
        $('#enableMFA1').prop("checked", false);
        $('#enableMFA0').prop("checked", true);
    }
    let oldTypeOfMfa = $('input[name=oldTypeOfMFA]').val();
    if (oldTypeOfMfa == 'email') {
        $('#typeOfMFAEmail').prop("checked", true);
        $('#typeOfMFACall').prop("checked", false);
        $('#typeOfMFAApp').prop("checked", false);
        $('#typeOfMFAAll').prop("checked", false);
    } else if (oldTypeOfMfa == 'call') {
        $('#typeOfMFAEmail').prop("checked", false);
        $('#typeOfMFACall').prop("checked", true);
        $('#typeOfMFAApp').prop("checked", false);
        $('#typeOfMFAAll').prop("checked", false);
    } else if (oldTypeOfMfa == 'app') {
        $('#typeOfMFAEmail').prop("checked", false);
        $('#typeOfMFACall').prop("checked", false);
        $('#typeOfMFAApp').prop("checked", true);
        $('#typeOfMFAAll').prop("checked", false);
    } else if (oldTypeOfMfa == 'all') {
        $('#typeOfMFAEmail').prop("checked", false);
        $('#typeOfMFACall').prop("checked", false);
        $('#typeOfMFAApp').prop("checked", false);
        $('#typeOfMFAAll').prop("checked", true);
    }
    handleMFA();
}


function stopCount() {
    clearTimeout(timeout);
}

timerOn = true;
timeout = false;
function timer(remaining, type) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    document.getElementById('timer').innerHTML = m + ':' + s;
    remaining -= 1;
    if (remaining >= 0 && timerOn) {
        timeout = setTimeout(function () {
            timer(remaining, type);
        }, 1000);
        return;
    }
    if (type == 'otp') {
        $("#timertext").html('<a class="text__base" href="javascript:void(0)" onClick="sendTestMail()" >Resend OTP<a>').fadeIn("slow", "swing");
    } else {
        $("#timertext").html('<a class="text__base" href="javascript:void(0)" onClick="makeTestCall()" >Request Call<a>').fadeIn("slow", "swing");
    }
    $("#timer").html('');
}

$('#mfaSettingsForm button[type=submit]').on('click', function (e) {
    e.preventDefault(); //prevent the default action
    let oldTypeOfMFA = $('input[name="oldTypeOfMFA"]').val();
    let newTypeOfMFA = $('input[name=typeOfMFA]:checked').val();
    let isMFAEnabled = $('input[name=enableMFA]:checked').val();
    if (isMFAEnabled == '1') {
        if (((oldTypeOfMFA == 'email' || oldTypeOfMFA == 'app' || oldTypeOfMFA == 'all') && (newTypeOfMFA == 'all' || newTypeOfMFA == 'call')) || (oldTypeOfMFA == 'all' && newTypeOfMFA == 'call')) {
            showCallTestFunctionalityTestModal();
        } else if (((oldTypeOfMFA == 'call' || oldTypeOfMFA == 'all') && (newTypeOfMFA == 'email' || newTypeOfMFA == 'all' || newTypeOfMFA == 'app'))) {
            showMailFuncationalityTestModal();
        } else {
            $('#mfaSettingsForm').submit();
        }
    } else {
        $('#mfaSettingsForm').submit();
    }
});

function showMailFuncationalityTestModal() {
    $('#systemWideEnableOrDisableConfirmationModal').modal('show');
    $('#systemWideEnableOrDisableConfirmationModalLabel').text(`${_('Validate PBX Email Setup')}`);

    $('#mfaEnableOrDisableConfirmationMessageDiv').html(`
             <div class="element-container" id="testmailWrapper">
                <div class="row">
                    <div class="form-group">
                        <div class="col-md-12">
                            <label class="control-label" for="testmail">
                                ${_("Enter email address where test email will be sent.")}
                            </label>
                        </div>
                        <div class="col-md-12">
                            <input type="text" class="form-control" id="testmail" name="testmail" value="" placeholder="Enter email address">
                        </div>
                    </div>
                </div>
            </div>
            <div class="element-container" id="otpWrapper" style="display:none;">
                <div class="row">
                    <div class="form-group">
                        <div class="col-md-12">
                            <label class="control-label" for="otp">
                                ${_("Enter OTP")}
                            </label>
                        </div>
                        <div class="col-md-12">
                            <input type="text" class="form-control" id="otp" name="otp" value="" placeholder="Enter OTP">
                        </div>
                    </div>
                </div>
            </div>
            `);

    $('#systemWideEnableOrDisableConfirmationModal .modal-footer').html(`
                <button type="button" class="btn btn-primary" onclick="sendTestMail()">Send Test Mail</button>
                <button type="button" class="btn btn-primary" onclick="skipTest()">Skip Test</button>
                <button type="button" class="btn btn-secondary" onclick="ignoreEnableOrDisableMFA()" data-dismiss="modal">Close</button>
            `)
}

function skipTest() {
    $('#mfaSettingsForm').submit();
}

function showCallTestFunctionalityTestModal() {
    $('#systemWideEnableOrDisableConfirmationModal').modal('show');
    $('#systemWideEnableOrDisableConfirmationModalLabel').text(`${_('Validate PBX Call Setup')}`);

    $('#mfaEnableOrDisableConfirmationMessageDiv').html(`
             <div class="element-container" id="testcallWrapper">
                <div class="row">
                    <div class="form-group">
                        <div class="col-md-12">
                            <label class="control-label" for="testcall">
                                ${_("Enter extension where test call will be made.")}
                            </label>
                        </div>
                        <div class="col-md-12">
                            <input type="text" class="form-control" id="testExtension" name="testExtension" value="" placeholder="Enter extension">
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 call__status">
                    </div>
                </div>
            </div>
            `);

    $('#systemWideEnableOrDisableConfirmationModal .modal-footer').html(`
                <button type="button" class="btn btn-primary" id="makeTestCallBtn" onclick="makeTestCall()">Make Test Call</button>
                <button type="button" class="btn btn-primary" onclick="skipTest()">Skip Test</button>
                <button type="button" class="btn btn-secondary" onclick="ignoreEnableOrDisableMFA()" data-dismiss="modal">Close</button>
            `)
}

$('input[name="typeOfMFA"]').change(function () {
    handleSettingsSubmitBtn();
})

$('input[name="typeOfUsers"]').change(function () {
    handleSettingsSubmitBtn();
})

$('input[name="enableMFA"]').change(function () {
    handleSettingsSubmitBtn();
})

function handleSettingsSubmitBtn() {
    let isMFAEnabledOnDB = $('input[name="isMFAEnabledOnDB"]').val();
    let typeOfUsersOnDB = $('input[name="oldTypeOfUsers"]').val();
    let typeOfMFAOnDB = $('input[name="oldTypeOfMFA"]').val();

    let isMFAEnabled = $('input[name=enableMFA]:checked').val();
    let typeOfUsers = $('input[name=typeOfUsers]:checked').val();
    let typeOfMFA = $('input[name=typeOfMFA]:checked').val();

    if ((isMFAEnabledOnDB == isMFAEnabled) && (typeOfUsersOnDB == typeOfUsers) && (typeOfMFAOnDB == typeOfMFA)) {
        $('#submitMfaSettings').hide();
        $('#settingsNoti').hide();
        if (typeOfMFA == 'email' || typeOfMFA == 'app' || typeOfMFA == 'all') {
            $('#EmailSettingsTab').show();
        } else {
            $('#EmailSettingsTab').hide();
        }
    } else {
        $('#submitMfaSettings').show();
        $('#settingsNoti').show();
        $('#EmailSettingsTab').hide();
    }

}

function getUserLimitDetails() {

    $.post("ajax.php?module=pbxmfa&command=getUserLimitDetails", {}, function (res) {
        $('.totalUsers').text(res.userLimit ? res.userLimit : 0);
        $('.enabledUsers').text(res.mfaEnabledUserLimit ? res.mfaEnabledUserLimit : 0);
        $('.remainingUsers').text(res.remainingUsers ? res.remainingUsers : 0);
        if (res.remainingUsers && res.remainingUsers > 0) {
            $('.remainingUsers').removeClass();
            $('.remainingUsers').addClass('text-success');
        } else {
            $('.remainingUsers').removeClass();
            $('.remainingUsers').addClass('text-danger');
        }
    });

}

$('#MFASettingsTab').click(function () {
    $('#EmailSettingsTabContent').hide().removeClass('active');
    $('#MFASettingsTabContent').show().addClass('active');
})

$('#EmailSettingsTab').click(function () {
    $('#MFASettingsTabContent').hide().removeClass('active');
    $('#EmailSettingsTabContent').show().addClass('active');
})

function handleCustomEmail() {
    let isCustomEmailEnabled = $('input[name="customEmailTemplate"]:checked').val();
    if (parseInt(isCustomEmailEnabled)) {
        $('.custom-mail-wrapper').show();
    } else {
        $('.custom-mail-wrapper').hide();
    }
}

$('#mfaEmailSettings button[type=submit]').on('click', function (e) {
    e.preventDefault();
    $('#otpHtmlEmailBody').val($('#otpHtmlEmailBody').Editor('getText'));
    $('#qrcodeHtmlEmailBody').val($('#qrcodeHtmlEmailBody').Editor('getText'));

    let otpEmailType = $('input[name="otpEmailType"]:checked').val();
    let qrcodeEmailType = $('input[name="qrcodeEmailType"]:checked').val();
    let mfaType = $('input[name=oldTypeOfMFA]').val();

    var formData = new FormData();
    formData.append('enableCustomEmailTemplate', parseInt($('input[name="customEmailTemplate"]:checked').val()));
    formData.append('otpEmailType', otpEmailType);
    formData.append('qrcodeEmailType', qrcodeEmailType);

    if (mfaType == 'email' || mfaType == 'all') {
        formData.append('otpEmailSubject', $('input[name="otpEmailSubject"]').val().trim());
        if (otpEmailType == 'text') {
            formData.append('otpEmailBody', $('#otpTextEmailBody').val());
        } else {
            formData.append('otpEmailBody', $('#otpHtmlEmailBody').Editor('getText'));
        }
    }

    if (mfaType == 'app' || mfaType == 'all') {
        formData.append('qrcodeEmailSubject', $('input[name="qrcodeEmailSubject"]').val().trim());
        if (qrcodeEmailType == 'text') {
            formData.append('qrcodeEmailBody', $('#qrcodeTextEmailBody').val());
        } else {
            formData.append('qrcodeEmailBody', $('#qrcodeHtmlEmailBody').Editor('getText'));
        }
    }

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "ajax.php?module=pbxmfa&command=saveEmailSettings",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.status) {
                fpbxToast(_(data.message));
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                fpbxToast(_(data.message), _('Error'), 'error');
            }
        },
        error: function (data) {
            fpbxToast(_('There was an error updating setting'), _('Error'), 'error');
        }
    });

});