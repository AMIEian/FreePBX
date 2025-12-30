const CALL_STATUS = {
    UNAVAILABLE: 'unavailable',
    INITIATED: 'initiated',
    SUCCESS: 'success',
    NOANSWER: 'noanswer',
    INVALID: 'invalid',
    TIMEOUT: 'timeout',
    FAILURE: 'failure',
};

function checkMFAenabled(usrname, pass, isThisUserChoice = false, verificationType = '', thisPointerFromLogin = false) {

    let username = usrname;
    let password = pass
    if (thisPointerFromLogin) {
        window.username = $('input[name="username"]', thisPointerFromLogin).val();
        window.password = encodePassword($('input[name="password"]', thisPointerFromLogin).val());
        username = window.username;
        password = window.password;
    }

    $(".resend__otp").show().fadeIn("slow", "swing");

    $.post("/admin/ajax.php?module=pbxmfa&command=checkMFAenabled",
        {
            username: username,
            password: password,
            loginpanel: 'admin',
            isThisUserChoice: isThisUserChoice,
            userChoiceAuthType: verificationType
        }
    ).done(function (response) {

        if (response.status) {

            if (response.isSessionAlreadyUnlocked) {

                window.location.reload();

            } else if (response.mfaType == 'app') {

                if (response.isUserHasConfiguredApp) {
                    $('#info').text(_('Enter the code displayed in the Authenticator app on your mobile device​'));
                    $('#enableMFAModalLabel span').text('TOTP Validation').css('color', 'inherit').css('margin-bottom', '0rem');
                } else {
                    $('.help__text').text('Note: If you have not received an email then please contact your adminstrator');
                    $('.help__text').show().fadeIn("slow", "swing");
                    $('#info').text(_('You have not configured Authenticator app on your mobile device. We have sent you an email with steps to configure. Please follow those steps and after configuring, enter the code displayed in the Authenticator app on your mobile device​')).css('color', '#c74a4a').css('margin-bottom', '1rem');;
                    $('#enableMFAModalLabel span').text('Configure Authenticator App before login');
                }
                $('#btn-validate span').text(_('Validate Code')).show().fadeIn("slow", "swing");
                $('.otp__input__group').show().fadeIn("slow", "swing");
                $('.resend__otp').hide();
                $('.help__text').hide();
                $('.ui-dialog').css("display", "none");
                $('#OTPModal').modal('show');
                $('#message').empty();

            } else if (response.mfaType == 'email') {

                if (response.attemptexceeded) {

                    fpbxToast(_(response.otpInfo), _('Error'), 'error');

                } else if (response.otpSentStatus) {
                    $('.otp__input__group').show().fadeIn("slow", "swing");
                    $('#OTPModal').modal('show');
                    $('#message').empty();
                    $('.ui-dialog').css("display", "none");
                    stopCount();
                    $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
                    timer(30); // In Seconds
                    $('#info').html(response.otpInfo);
                    handleAlertMessage(_(`OTP is sent to registered Email Address`), 'success', true);

                } else {
                    $('.otp__input__group').show().fadeIn("slow", "swing");
                    $('#OTPModal').modal('show');
                    $('#message').empty();
                    $('.ui-dialog').css("display", "none");
                    if (response.otpAlreadySent) {
                        if (!timeout) {
                            $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
                            timer(30); // In Seconds
                        }
                        $('#info').html(response.otpInfo);
                        handleAlertMessage(_(`OTP is already sent to registered Email Address`), 'info', true);
                    } else {
                        handleRerequestButton(true);
                        handleAlertMessage(_(`Not able to send Mail. Please try again..!!`), 'danger', true);
                    }
                }

            } else if (response.mfaType == 'call') {
                $('.ui-dialog').css("display", "none");
                $('#enableMFAModalLabel').text('Call Verification');
                $('.help__text').hide();
                $('.otp__input__group').hide();
                $('#btn-validate').hide();
                $('#clearOTP').hide();
                if (response.callStatus) {
                    stopCount();
                    $("#timertext").html('Request call again in').fadeIn("slow", "swing");
                    timer(40, 'call'); // In Seconds
                    $('#info').html(`
                            <p>${_('Answer the call and press # to authenticate your login.')}</p>
                            <img src="/admin/modules/pbxmfa/assets/images/calling.svg" alt="calling"/>
                        `);
                    $('#OTPModal').modal('show');
                    $('#message').empty();
                    handleAlertMessage(_(response.callInfo), 'success', true);
                    getCallStatus(response.callAuthId, username, password, 'admin');
                } else {
                    if (response.attemptexceeded) {
                        fpbxToast(_(response.callInfo), _('Error'), 'error');
                    } else {
                        $('.ui-widget-overlay').css('display', 'none');
                        $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                        if (response.message) {
                            fpbxToast(_("Not able to make call. " + response.message), _('Error'), "error");
                        } else {
                            fpbxToast(_(`Not able to call. Refresh your browser and try again.`), _('Error'), "error");
                        }
                    }
                }
            } else if (response.mfaType == 'all') {
                $('#info').hide();
                $('.ui-dialog').css("display", "none");
                $('#enableMFAModalLabel').text('Verify your identity');
                $('.help__text').hide();
                $('.otp__input__group').hide();
                $('#btn-validate').hide();
                $('#clearOTP').hide();
                $('#OTPModal').modal('show');
                $('#message').empty();
                $('.otp__input__group').hide();
                $('#OTPModal .modal-footer').attr('style', 'display: none !important');
                $('.type__of__verification').empty();
                $('#OTPModal .modal-body').append(`
                    <ul class="list-group type__of__verification">
                        <li class="list-group-item" onClick="handleTypeOfVerification('app','${username}','${password}')">
                            <img src="/admin/modules/pbxmfa/assets/images/auth-app.svg" alt="authenticator-app" />
                            Use verification code from authenticator app
                        </li>
                        <li class="list-group-item" onClick="handleTypeOfVerification('email','${username}','${password}')">
                            <img src="/admin/modules/pbxmfa/assets/images/email.svg" alt="authenticator-app" />
                            Receive OTP on <b>${response.usermail}</b> email address
                        </li>
                        <li class="list-group-item" onClick="handleTypeOfVerification('call','${username}','${password}')">
                            <img src="/admin/modules/pbxmfa/assets/images/call.svg" alt="authenticator-app" />
                            Receive call on <b>${response.extension}</b>
                        </li>
                    </ul>
                `)
            }
        } else {
            fpbxToast(_(response.message), _('Error'), 'error');
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });

    return false
};

function handleTypeOfVerification(verificationType, username, password) {
    $.post("/admin/ajax.php?module=pbxmfa&command=updateUserChoiceOfMFA",
        {
            userChoiceAuthType: verificationType,
            loginpanel: 'admin',
            username: username,
            password: password
        }
    ).done(function (response) {
        if (response.status) {
            let isThisUserChoice = true;
            checkMFAenabled(username, password, isThisUserChoice, verificationType);
            handleAlertMessage('', '', false);
            $('#info').css('color', 'inherit').show().fadeIn("slow", "swing");
            $('#OTPModal .modal-footer').attr('style', 'display: flex  !important');
            $('#btn-validate').show().fadeIn("slow", "swing");
            $('.type__of__verification').hide();
        } else {
            fpbxToast(_(response.message ? response.message : "Something went wrong. Please try again"), _('Error'), "error");
            $('#OTPModal').modal('hide');
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });
}

function validateOTP() {
    var otp = getOTPFromForm();
    handleAlertMessage('', '', false);
    if (otp.length < 6) {
        handleAlertMessage(_('Please enter valid OTP'), 'danger', true);
    }
    $.post("/admin/ajax.php?module=pbxmfa&command=verifyOTP",
        {
            username: window.username,
            password: window.password,
            otp: otp,
            loginpanel: 'admin'
        }
    ).done(function (response) {
        if (!response.status) {
            if (response.disableResendOtp) {
                handleRerequestButton(false);
            }
            handleAlertMessage(_(response.message), 'danger', true);
        } else {

            if (response.isSessionAlreadyUnlocked) {

                trustThisDevice();

            }

        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });
}

function getOTPFromForm() {
    var otp = $("input[name=otp-0]").val();
    otp += $("input[name=otp-1]").val();
    otp += $("input[name=otp-2]").val();
    otp += $("input[name=otp-3]").val();
    otp += $("input[name=otp-4]").val();
    otp += $("input[name=otp-5]").val();
    return otp;
}

function resetOTPFromForm() {
    for (let i = 0; i < 6; i++) {
        const selector = `input[name=otp-${i}]`;
        $(selector).val('');
    }
    $(`input[name=otp-0]`).focus();
}

function closeOTPModal() {
    resetOTPFromForm();
    $('#OTPModal').modal('hide');
    $("body > div.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons.ui-draggable").remove();
    $("body > div.ui-widget-overlay.ui-front").remove();
    window.location.reload();
}

let timerOn = true;
let timeout = false;
function timer(remaining, resendType = 'otp') {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    document.getElementById('timer').innerHTML = m + ':' + s;
    remaining -= 1;
    if (remaining >= 0 && timerOn) {
        timeout = setTimeout(function () {
            timer(remaining, resendType);
        }, 1000);
        return;
    }
    handleRerequestButton(true, resendType);
}

function handleRerequestButton(showBtn, resendType = 'otp') {
    if (showBtn) {
        $(".resend__otp").show().fadeIn("slow", "swing");
        if (resendType == 'otp') {
            $("#timertext").html('<a class="text__base" href="javascript:void(0)" onClick="resendOTP()" >Resend OTP<a>').fadeIn("slow", "swing");
        } else {
            $("#timertext").html('<a class="text__base" href="javascript:void(0)" onClick="requestCallAgain()" >Request call again<a>').fadeIn("slow", "swing");
        }
        $("#timer").html('');
    } else {
        $(".resend__otp").hide();
    }
}

function stopCount() {
    clearTimeout(timeout);
}

function resendOTP() {
    handleAlertMessage('', '', false);
    resetOTPFromForm();
    $.post("/admin/ajax.php?module=pbxmfa&command=resendOTP",
        {
            username: window.username,
            password: window.password,
            loginpanel: 'admin'
        }
    ).done(function (response) {
        if (response.otpSentStatus) {
            stopCount();
            $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
            timer(30); // In Seconds
            handleAlertMessage(_(`OTP is sent to registered Email Address`), 'success', true);
        } else if (response.attemptexceeded) {
            handleRerequestButton(false);
            handleAlertMessage(_('Resend attempt is exceeded. Refresh your browser and try again.'), 'danger', true);
        } else {
            handleRerequestButton(true);
            handleAlertMessage(_(response.message ? response.message : `Not able to send Mail. Please try again..!!`), 'danger', true);
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), 'error');
    });
}

function requestCallAgain() {
    handleAlertMessage('', '', false);
    $('#info').html();
    $.post("/admin/ajax.php?module=pbxmfa&command=requestCall",
        {
            username: window.username,
            password: window.password,
            loginpanel: 'admin'
        }
    ).done(function (response) {
        if (response.callStatus) {
            stopCount();
            $("#timertext").html('Request call again in').fadeIn("slow", "swing");
            timer(40, 'call'); // In Seconds
            $('#info').html(`
                        <p>${_('Answer the call and press # to authenticate your login.')}</p>
                        <img src="/admin/modules/pbxmfa/assets/images/calling.svg" alt="calling"/>
                    `);
            handleAlertMessage(_(response.callInfo), 'success', true);
            getCallStatus(response.callAuthId, window.username, window.password, 'admin');

        } else if (response.attemptexceeded) {
            $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/error.svg" alt="error"/>`);
            handleRerequestButton(false, 'call');
            handleAlertMessage(_('Request attempt is exceeded. Refresh your browser and try again.'), 'danger', true);
        } else {
            $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
            handleRerequestButton(true, 'call');
            if (response.message) {
                handleAlertMessage(_(`Not able to call. ${response.message}`), 'danger', true);
            } else {
                handleAlertMessage(_(`Not able to call. Refresh your browser and try again.`), 'danger', true);
            }
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), "error");
    });
}

/**
 *  Below are the functions related to Paste / Entering OTP
 */

document.querySelector('body').addEventListener('paste', handleOTPPaste);
const OTPCodeInput = [...document.querySelectorAll('.otc-input')];
const firstInput = document.getElementById('otc-1');

const populateNextInput = (targetEl, inputValue) => {
    // Apply first item to first input
    targetEl.value = inputValue[0];
    // remove the first character
    const newInputValue = inputValue.substring(1);

    if (targetEl.nextElementSibling && targetEl.nextElementSibling.tagName === 'INPUT') {
        targetEl.nextElementSibling.select();
        // Do the same to the next element and next data
        if (newInputValue.length) {
            populateNextInput(targetEl.nextElementSibling, newInputValue);
        }
    }
};

const spreadNumber = (targetEl, inputValue) => {
    // one more check to secure spreading digits
    if (!inputValue || (inputValue && inputValue.length === 1)) {
        return;
    }

    populateNextInput(targetEl, inputValue);
};

const handleOTPInputChange = (e) => {
    // remove non-digit inputs
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/\D/g, "");

    // if enter more than one digits at a time, i.e copy pasting or typing really fast, spread the value to sibling inputs, otherwise do nothing
    if (inputValue.length > 1) {
        spreadNumber(e.target, inputValue);
    } else {
        e.target.value = inputValue;
        // move the pointer to next input field if use has done typing
        if (inputValue && e.target.nextElementSibling && e.target.nextElementSibling.tagName === 'INPUT') {
            e.target.nextElementSibling.select();
        }
    }
};

// setup input fields event listeners
if (OTPCodeInput) {
    OTPCodeInput.forEach(function (inputField) {
        // control on keyup to catch user intention such as 'delete', 'move forward', 'move backward'
        inputField.addEventListener("keyup", function (e) {
            // On Backspace or left arrow, go to the previous field.
            if (
                (e.keyCode === 8 || e.keyCode === 37) &&
                this.previousElementSibling &&
                this.previousElementSibling.tagName === "INPUT"
            ) {
                this.previousElementSibling.focus();
            }
            if (e.keyCode === 39 &&
                this.nextElementSibling &&
                this.nextElementSibling.tagName === "INPUT"
            ) {
                this.nextElementSibling.select();
            }
        });
        /** Better control on Focus
         * don't allow focus on other field if the first one is empty
         * get the focus on the first empty field
         * don't allow focus on field if the previous one if empty (debatable)
         **/
        inputField.addEventListener("focus", function (e) {
            if (firstInput) {
                // If the focus element is the first one, do nothing
                if (this === firstInput) {
                    return;
                }
                // If value of input 1 is empty, focus it.
                if (firstInput.value === "") {
                    firstInput.focus();
                }
                // If value of a previous input is empty, focus it.
                // To remove if you don't wanna force user respecting the fields order.
                if (this.previousElementSibling.value === "") {
                    this.previousElementSibling.focus();
                }
            }
        });

        inputField.addEventListener("input", handleOTPInputChange);
    });
}

const concatNumber = () => {
    const miniInputs = [...document.querySelectorAll(".mini")];
    otpInput.value = miniInputs.map((input) => input.value).join("");
};

function handleOTPPaste(e) {
    if ($('#OTPModal').hasClass('show')) {
        var clipboardData, pastedData;

        // Stop data actually being pasted into div
        e.stopPropagation();
        e.preventDefault();

        // Get pasted data via clipboard API
        clipboardData = e.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');

        // Do whatever with pasteddata
        if (pastedData.length > 0) {
            pastedData = pastedData.split('');
            for (let i = 0; i < pastedData.length; i++) {
                $(`input[name=otp-${i}]`).val(pastedData[i]);
            }
        }
    }
}

function handleAlertMessage(message, type, canShow, delay = 5000) {
    $('#message').empty();
    $('#message').append(
        `<div class="alert alert-${type} text-center">${message}</div>`
    );
    if (canShow) {
        $('#message').show().fadeIn("fast").delay(5000);
    } else {
        $('#message').hide();
    }
}

function getCallStatus(callAuthId, username, password, loginpanel) {

    $.post("/admin/ajax.php?module=pbxmfa&command=getCallStatus",
        {
            callAuthId: callAuthId,
            username: username,
            password: password,
            loginpanel: loginpanel
        }
    ).done(function (response) {

        if (response.status) {

            if (response.callstatus == CALL_STATUS.SUCCESS) {

                if (response.isauthenticated) {
                    trustThisDevice();
                } else {

                    $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                    handleAlertMessage(_(`Not able to authenticate. Please try again..!!`), 'danger', true);
                }

            } else if (response.callstatus == CALL_STATUS.INITIATED) {

                setTimeout(() => {

                    getCallStatus(callAuthId, username, password, loginpanel);

                }, 1000);

            } else if (response.callstatus == CALL_STATUS.INVALID) {

                $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/invalid.svg" alt="invalid"/>`);
                handleAlertMessage(_(`We called your phone but did not receive expected response. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.NOANSWER) {

                $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/noanswer.svg" alt="noanswer"/>`);
                handleAlertMessage(_(`No answer. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.TIMEOUT) {

                $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/timeout.svg" alt="timeout"/>`);
                handleAlertMessage(_(`Call timeout. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.UNAVAILABLE){

                $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                handleAlertMessage(_(`Extension / Phone number is not available. Please try again..!!`), 'danger', true);

            } else {

                $('#info').html(`<img src="/admin/modules/pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                if (response.message) {
                    handleAlertMessage(_("Not able to make call. " + response.message), 'danger', true);
                } else {
                    handleAlertMessage(_(`Not able to make call. Please try again..!!`), 'danger', true);
                }

            }
        } else {
            handleAlertMessage(response.message ? response.message : _(`Not able to authenticate. Please try again..!!`), 'danger', true);
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error),_('Error') ,"error");
    });
}

$('#recoveryCode').click(function () {
    $('#enableMFAModalLabel').text('Verify your identity');
    $('.type__of__verification').hide();
    handleAlertMessage('', '', false);
    $('.otp__input__group').show().fadeIn("slow", "swing");
    $("#timertext").hide().fadeIn("slow", "swing");
    $('.help__text').hide();
    $('.resend__otp').hide();
    $('#info').show().html(_('If you are unable to access your device for the OTP then please enter one of your recovery codes to verify your identity.')).css('color', '#000000');
    $('#OTPModal .modal-footer').empty().show();
    $('#OTPModal .modal-footer').html(`
        <button type="button" onClick="verifyRecoveryCode()" class="btn btn-primary">Verify</button>
        <div class="resend__otp" style="display:none;"><span id="timertext"></span>&nbsp;<span id="timer"></span></div>
    `);
    $('.recovery__code__help').hide();
});

function verifyRecoveryCode() {

    let username = window.username;
    let password = window.password;
    var otp = getOTPFromForm();

    handleAlertMessage('', '', false);

    if (otp.length < 6) {
        handleAlertMessage(_('Please enter valid OTP'), 'danger', true);
    }

    $.post("/admin/ajax.php?module=pbxmfa&command=verifyRecoveryCode",
        {
            username: username,
            password: password,
            otp: otp,
            loginpanel: 'admin'
        }
    ).done(function (response) {
        if (response.status) {
            if (response.isValidCode) {
                handleAlertMessage(_(response.message), 'success', true);
                trustThisDevice();
            }
        } else {
            handleAlertMessage(_(response.message), 'danger', true);
        }
    }).fail(function (xhr, status, error) {
        fpbxToast(_(error), _('Error'), "error");
    });
}

function trustThisDevice() {

    var username = window.username;
    var password = window.password;

    if ($("input[name=trustDevice]").prop('checked') == true) {
        $.post("/admin/ajax.php?module=pbxmfa&command=trustThisDevice",
            {
                username: username,
                password: password,
                loginpanel: 'admin',
                trustDevice: true
            }
        ).done(function (response) {
            window.location.reload();
        }).fail(function (xhr, status, error) {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }

}


function encodePassword(password) {
    if (password) {
        return encodeURIComponent(window.btoa(password))
    }
    return password
}
