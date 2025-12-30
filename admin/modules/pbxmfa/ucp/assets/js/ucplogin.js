const CALL_STATUS = {
    UNAVAILABLE: 'unavailable',
    INITIATED: 'initiated',
    SUCCESS: 'success',
    NOANSWER: 'noanswer',
    INVALID: 'invalid',
    TIMEOUT: 'timeout',
    FAILURE: 'failure',
};

let BASE_URL = window.location.origin + window.location.pathname;

$("#btn-mfalogin").click(function (event) {
    let username = $("input[name=username]").val().trim();
    let password = encodePassword($("input[name=password]").val().trim());
    checkMFAEnabled(username, password);
});

function checkMFAEnabled(username, password, isThisUserChoice = false, verificationType = '') {
    $(".resend__otp").show().fadeIn("slow", "swing");
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=checkMFAenabled",
        {
            username: username,
            password: password,
            rememberme: $('#rememberme').is(":checked"),
            loginpanel: 'ucp',
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
                $('.otp__input__group').show().fadeIn("slow", "swing");
                $('.resend__otp').hide();
                $('.help__text').hide();
                $('#OTPModal').modal('show');
                $('#message').empty();
                $('.ui-dialog').css("display", "none");
                $('#btn-validate span').text(_('Validate Code'));
                $('#enableMFAModalLabel').text('TOTP Validation')

            } else if (response.mfaType == 'email') {

                if (response.attemptexceeded) {
                    UCP.showAlert(_(response.otpInfo), "error");

                } else if (response.otpSentStatus) {
                    $('.otp__input__group').show().fadeIn("slow", "swing");
                    stopCount();
                    $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
                    timer(30); // In Seconds
                    $('#info').html(response.otpInfo);
                    $('#OTPModal').modal('show');
                    $('#message').empty();
                    handleAlertMessage(_(`OTP is sent to to registered Email Address`), 'success', true);

                } else {
                    $('.otp__input__group').show().fadeIn("slow", "swing");
                    if (response.otpAlreadySent) {
                        if (!timeout) {
                            $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
                            timer(30); // In Seconds
                        }
                        $('#info').html(response.otpInfo);
                        $('#OTPModal').modal('show');
                        $('#message').empty();
                        handleAlertMessage(_(`OTP is already sent to registered Email Address`), 'info', true);
                    } else {
                        handleRerequestButton(true);
                        UCP.showAlert(_(`Not able to send Mail. Please try again..!!`), "error");
                    }

                }
            } else if (response.mfaType == 'call') {
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
                        <img src="${BASE_URL}/modules/Pbxmfa/assets/images/calling.svg" alt="calling"/>
                    `);
                    $('#OTPModal').modal('show');
                    $('#message').empty();
                    handleAlertMessage(_(response.callInfo), 'success', true);
                    getCallStatus(response.callAuthId, username, password, 'ucp');
                } else {

                    if (response.attemptexceeded) {
                        UCP.showAlert(_(response.callInfo), 'error');
                    } else {
                        $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                        if (response.message) {
                            UCP.showAlert(_("Not able to make call. " + response.message), "error");
                        } else {
                            UCP.showAlert(_(`Not able to call. Refresh your browser and try again.`), "error");
                        }
                    }

                }
            } else if (response.mfaType == 'all') {
                $('#info').hide();
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
                            <img src="${BASE_URL}/modules/Pbxmfa/assets/images/auth-app.svg" alt="authenticator-app" />
                            Use verification code from authenticator app
                        </li>
                        <li class="list-group-item" onClick="handleTypeOfVerification('email','${username}','${password}')">
                            <img src="${BASE_URL}/modules/Pbxmfa/assets/images/email.svg" alt="authenticator-app" />
                            Receive OTP on <b>${response.usermail}</b> email address
                        </li>
                        <li class="list-group-item" onClick="handleTypeOfVerification('call','${username}','${password}')">
                            <img src="${BASE_URL}/modules/Pbxmfa/assets/images/call.svg" alt="authenticator-app" />
                            Receive call on <b>${response.extension}</b>
                        </li>
                    </ul>
                `)
            }

        } else {
            $('#error-msg').html(response.message).show().fadeIn("slow", "swing");
            setTimeout(() => {
                $('#error-msg').html('').hide();
            }, 5000);
            handleAlertMessage(_(response.message), 'danger', true);
        }
    }).fail(function (xhr, status, error) {
        UCP.showAlert(_(error), "error");
    });
}

function handleTypeOfVerification(verificationType, username, password) {
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=updateUserChoiceOfMFA",
        {
            userChoiceAuthType: verificationType,
            loginpanel: 'ucp',
            username: username,
            password: password
        }
    ).done(function (response) {
        if (response.status) {
            let isThisUserChoice = true;
            checkMFAEnabled(username, password, isThisUserChoice, verificationType);
            handleAlertMessage('', '', false);
            $('#info').css('color', 'inherit').show().fadeIn("slow", "swing");
            $('#OTPModal .modal-footer').attr('style', 'display: flex  !important');
            $('#btn-validate').show().fadeIn("slow", "swing");
            $('.type__of__verification').hide();
        } else {
            UCP.showAlert(response.message ? response.message : _("Something went wrong. Please try again"), "error");
            $('#OTPModal').modal('hide');
        }
    }).fail(function (xhr, status, error) {
        UCP.showAlert(_(error), "error");
    });
}

function validateOTP() {

    var username = $("input[name=username]").val();
    var password = encodePassword($("input[name=password]").val());
    var otp = getOTPFromForm();

    handleAlertMessage('', '', false);

    if (otp.length < 6) {
        handleAlertMessage(_('Please enter valid OTP'), 'danger', true);
    }

    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=verifyOTP",
        {
            username: username,
            password: password,
            otp: otp,
            loginpanel: 'ucp'
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
        UCP.showAlert(_(error), "error");
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
    let username = $("input[name=username]").val().trim();
    let password = encodePassword($("input[name=password]").val().trim());

    handleAlertMessage('', '', false);
    resetOTPFromForm();

    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=resendOTP",
        {
            username: username,
            password: password,
            loginpanel: 'ucp'
        }
    ).done(function (response) {
        if (response.otpSentStatus) {
            stopCount();
            $("#timertext").html('Resend OTP in').fadeIn("slow", "swing");
            timer(30);  // In Seconds
            handleAlertMessage(_(`OTP is sent to registered Email Address`), 'success', true);
        } else if (response.attemptexceeded) {
            handleRerequestButton(false);
            handleAlertMessage(_('Resend attempt is exceeded. Refresh your browser and try again.'), 'danger', true);
        } else {
            handleRerequestButton(true);
            handleAlertMessage(response.message ? response.message : _(`Not able to send Mail. Please try again..!!`), 'danger', true);
        }
    }).fail(function (xhr, status, error) {
        UCP.showAlert(_(error), "error");
    });
}

function requestCallAgain() {
    let username = $("input[name=username]").val().trim();
    let password = encodePassword($("input[name=password]").val().trim());
    handleAlertMessage('', '', false);
    $('#info').html();
    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=requestCall",
        {
            username: username,
            password: password,
            loginpanel: 'ucp'
        }
    ).done(function (response) {
        if (response.callStatus) {
            stopCount();
            $("#timertext").html('Request call again in').fadeIn("slow", "swing");
            timer(40, 'call'); // In Seconds
            $('#info').html(`
                        <p>${_('Answer the call and press # to authenticate your login.')}</p>
                        <img src="${BASE_URL}/modules/Pbxmfa/assets/images/calling.svg" alt="calling"/>
                    `);
            handleAlertMessage(_(response.callInfo), 'success', true);
            getCallStatus(response.callAuthId, username, password, 'ucp');

        } else if (response.attemptexceeded) {
            $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/error.svg" alt="error"/>`);
            handleRerequestButton(false, 'call');
            handleAlertMessage(_('Request attempt is exceeded. Refresh your browser and try again.'), 'danger', true);
        } else {
            $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
            handleRerequestButton(true, 'call');
            if (response.message) {
                handleAlertMessage(_("Not able to make call. " + response.message), 'danger', true);
            } else {
                handleAlertMessage(_(`Not able to call. Refresh your browser and try again.`), 'danger', true);
            }
        }
    }).fail(function (xhr, status, error) {
        UCP.showAlert(_(error), "error");
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

    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=getCallStatus",
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

                    $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                    handleAlertMessage(_(`Not able to authenticate. Please try again..!!`), 'danger', true);
                }

            } else if (response.callstatus == CALL_STATUS.INITIATED) {

                setTimeout(() => {

                    getCallStatus(callAuthId, username, password, loginpanel);

                }, 1000);

            } else if (response.callstatus == CALL_STATUS.INVALID) {

                $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/invalid.svg" alt="invalid"/>`);
                handleAlertMessage(_(`We called your phone but did not receive expected response. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.NOANSWER) {

                $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/noanswer.svg" alt="noanswer"/>`);
                handleAlertMessage(_(`No answer. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.TIMEOUT) {

                $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/timeout.svg" alt="timeout"/>`);
                handleAlertMessage(_(`Call timeout. Please try again..!!`), 'danger', true);

            } else if (response.callstatus == CALL_STATUS.UNAVAILABLE) {

                $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
                handleAlertMessage(_(`Extension / Phone number is not available. Please try again..!!`), 'danger', true);

            } else {

                $('#info').html(`<img src="${BASE_URL}/modules/Pbxmfa/assets/images/notabletocall.svg" alt="notabletocall"/>`);
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
        UCP.showAlert(_(error), "error");
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

    let username = $("input[name=username]").val().trim();
    let password = encodePassword($("input[name=password]").val().trim());
    var otp = getOTPFromForm();

    handleAlertMessage('', '', false);

    if (otp.length < 6) {
        handleAlertMessage(_('Please enter valid OTP'), 'danger', true);
    }

    $.post(UCP.ajaxUrl + "?module=pbxmfa&command=verifyRecoveryCode",
        {
            username: username,
            password: password,
            otp: otp,
            loginpanel: 'ucp'
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
        UCP.showAlert(_(error), "error");
    });
}

function trustThisDevice() {

    var username = $("input[name=username]").val();
    var password = encodePassword($("input[name=password]").val());

    if ($("input[name=trustDevice]").prop('checked') == true) {
        $.post(UCP.ajaxUrl + "?module=pbxmfa&command=trustThisDevice",
            {
                username: username,
                password: password,
                loginpanel: 'ucp',
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
