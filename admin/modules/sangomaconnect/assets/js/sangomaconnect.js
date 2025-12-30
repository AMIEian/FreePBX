const NEW_VERSION_AVAILABLE = 'New firmware version available',
	UP_TO_DATE = 'The gateway is up to date',
	REFRES_TABLE = 'Refresh the table'
const talkAlert = `Disabling Sangoma Talk will also disable the Desktop Client, along with the user's Queue and Supervisor permissions. Do you wish to proceed?`;
const scdAlert = `Please note that doing so will also revoke the user's Queue and Supervisor permissions.`;
var scope = (function ($, window, document, undefined) {
	var selectUsers = [],
		scdEnabledUserCount = 0,
		$removeButton = $('#remove-all'),
		$inviteButton = $('#invite-all'),
		$enableButton = $('#enable-all'),
		$installSSl = $('#domain-action'),
		$table = $('#table-all'),
		$tableAllUsers = $('#table-all-users'),
		$tableDevices = $('#sc-devices'),
		$dynamicModal = $('#dynamic-modal'),
		$ssllink = $('#ssllink'),
		$bulkTopMessage = $('#bulkTopMessage'),
		$resetServer = $('#resetSangomaConnectServer'),
		$installProxy = $('#cloudconnect-action'),
		$pclink = $('#pclink'),
		$advancedSettingsSave = $('#advancedSettingsSave')

	$('.nav-tabs a').on('show.bs.tab', function (e) { })

	$tableAllUsers.on('page-change.bs.table', function () {
		$enableButton.prop('disabled', true)
		selectUsers.slice(0, selectUsers.length)
	})
	$tableAllUsers.on(
		'check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table',
		function () {
			var $this = $(this),
				id = $this.prop('id'),
				toolbar = $this.data('toolbar')
			$enableButton.prop(
				'disabled',
				!$this.bootstrapTable('getSelections').length
			)
			selectUsers = $.map($this.bootstrapTable('getSelections'), function (
				row
			) {
				return row.id
			})
		}
	)

	$table.on('page-change.bs.table', function () {
		$removeButton.prop('disabled', true)
		$inviteButton.prop('disabled', true)
		selectUsers.slice(0, selectUsers.length)
	})
	$table.on(
		'check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table',
		function () {
			var $this = $(this),
				id = $this.prop('id'),
				toolbar = $this.data('toolbar')
			$removeButton.prop(
				'disabled',
				!$this.bootstrapTable('getSelections').length
			)
			$inviteButton.prop(
				'disabled',
				!$this.bootstrapTable('getSelections').length
			)
			scdEnabledUserCount = 0;
			selectUsers = $.map($this.bootstrapTable('getSelections'), function (
				row
			) {
				if (row.webrtcEnabled == '1') {
					scdEnabledUserCount++;
				}
				return row.id
			})
		}
	)

	$table.on('page-change.bs.table', function () {
		selectUsers.slice(0, selectUsers.length)
	})

	$tableAllUsers.on('page-change.bs.table', function () {
		selectUsers.slice(0, selectUsers.length)
	})

	$(document).on("click", 'a[id^="pclink"]', function () {
		$installProxy.attr("disabled", false);
	});

	//Making Password Modal work
	$(document).on("click", 'a[id^="viewlinkmodal"]', function () {
		var link = $(this).data('temp_password');
		$("#loginlink").val(link);
	});


	$installProxy.on('click', function () {
		var $this = $(this);
		var action = $("#connectcloud-action-selector option:selected").text()
		$pclink.attr("disabled", true);

		var _install_completed = false;
		var timer = undefined;
		if (action == "install" || action == "update") {
			$(".progress-bar").css("width", "");
			$(".progress").removeClass("hidden");
			$(".progress-bar").addClass("active");

			timer = setInterval(function () {

				if (_install_completed) {
					clearInterval(timer);
					window.location.reload();
					return;
				}

				$.post("ajax.php", { command: "getProxyInstallProgress", module: "sangomaconnect" }, function (data) {
					var perc = undefined;
					if (!data.status) {
						perc = "100";
						alert(data.message)
					} else {
						perc = data.percentage;
					}
					$(".progress-bar").css("width", perc + "%");
					$(".progress-bar").html(perc + '%');

					if (perc === "100" || perc === 100) {
						_install_completed = true;
						$pclink.attr("disabled", false);
						$(".progress-bar").removeClass("active");
						$(".progress-bar").addClass("hidden");
					}
				});
			}, 5000);

			$.post("ajax.php", { command: "installProxyClient", module: "sangomaconnect" }, function (data) {
				if (!data.status) {
					$this.prop("disabled", false);
					clearInterval(timer);
					$(".progress-bar").removeClass("active");
					$(".progress-bar").addClass("hidden");
				}
				$('#cloudconnect').modal('hide');
			});
		} else {
			$.post("ajax.php", { command: "processProxyClientAction", module: "sangomaconnect", action: action }, function (data) {
				$pclink.attr("disabled", false);
				$('#cloudconnect').modal('hide');
			}).always(function () {
				$pclink.attr("disabled", false);
				$('#cloudconnect').modal('hide');
				window.location.reload();
			});

		}
	});

	$("#show_chat_status1").on('click', function () {
		$("#attachments_max_disk_size").prop('disabled', false);
		$("#attachments_max_size").prop('disabled', false);
		$("#chat_retention_days").prop('disabled', false);
	})
	$("#show_chat_status2").on('click', function () {
		$("#attachments_max_disk_size").prop('disabled', true);
		$("#attachments_max_size").prop('disabled', true);
		$("#chat_retention_days").prop('disabled', true);
	})

	$inviteButton.on('click', function () {
		var $this = $(this)
		$('.dynamic', $dynamicModal).hide()
		$('.modal-body.server-warning p', $dynamicModal).html(
			'Are you sure you wish to Invite the selected users to Sangoma Talk'
		)
		$('.server-warning', $dynamicModal).show()
		$("#dynamic-action-button", $dynamicModal).unbind('click');
		$('#dynamic-action-button', $dynamicModal).one('click', function () {
			$this.find('span').text(_('Inviting...'))
			$this.prop('disabled', true)
			$removeButton.prop('disabled', true)
			$dynamicModal.modal('hide')
			$.post(
				'ajax.php',
				{
					command: 'generateTmpPwd',
					module: 'sangomaconnect',
					users: selectUsers
				},
				function (data) {
					if (data.status) {
						$table.bootstrapTable('refresh')
						window.location.reload()
					} else {
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html(
							data.message || 'Something went wrong!'
						)
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(data)
					}
					selectUsers = []
				}
			)
		})
		$dynamicModal.modal('show')
	})

	$removeButton.on('click', function () {
		var $this = $(this)
		var userType = $("#user-type").val();
		var command = userType == 'userlist' ? 'removeAll' : 'scdDisableAll';
		var msg = userType == 'userlist' ? 'Sangoma Talk' : 'Desktop Phone Setup Wizard';
		var alertText = '';
		$('.dynamic', $dynamicModal).hide()
		var scdWarningMsg = '';
		if (userType == 'userlist' && scdEnabledUserCount > 0) {
			scdWarningMsg = 'Sangoma Phone Desktop Client is already enabled for some of the selected users. ' + talkAlert;
		}
		alertText = 'Are you sure you want to disable ' + msg + ' for the selected users? ' + scdWarningMsg;
		if (userType == 'scdUserEnabledlist') {
			alertText = 'Are you sure you want to disable ' + msg + ' for the selected users? ' + scdAlert;
		}
		$('.modal-body.server-warning p', $dynamicModal).html(alertText);
		$('.server-warning', $dynamicModal).show()
		$("#dynamic-action-button", $dynamicModal).unbind('click');
		$('#dynamic-action-button', $dynamicModal).one('click', function () {
			$this.find('span').text(_('Removing...'))
			$this.prop('disabled', true)
			$removeButton.prop('disabled', true)
			$dynamicModal.modal('hide')
			$.post(
				'ajax.php',
				{ command: command, module: 'sangomaconnect', users: selectUsers },
				function (data) {
					if (data.status) {
						$table.bootstrapTable('refresh')
						selectUsers = []
						window.location.reload()
					} else {
						$this.find('span').text(_('Remove Users'));
						$this.prop('disabled', false);
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html(
							data.message || 'Something went wrong!'
						)
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(data)
					}
				}
			)
		})
		$dynamicModal.modal('show')
	})

	$enableButton.on('click', function () {
		var $this = $(this)
		var userType = $("#enable-user-type").val();
		var command = userType == 'alluserlist' ? 'enableAll' : 'scdEnableAll';
		var msg = userType == 'alluserlist' ? 'Sangoma Talk' : 'Sangoma Phone Desktop Client';
		$('.dynamic', $dynamicModal).hide()
		$('.modal-body.server-warning p', $dynamicModal).html(
			'Are you sure you want to enable ' + msg + ' for the selected users?'
		)
		$('.server-warning', $dynamicModal).show()
		$("#dynamic-action-button", $dynamicModal).unbind('click');
		$('#dynamic-action-button', $dynamicModal).one('click', function () {
			$this.find('span').text(_('Enabling...'))
			$this.prop('disabled', true)
			$enableButton.prop('disabled', true)
			$dynamicModal.modal('hide')

			$.post(
				'ajax.php',
				{ command: command, module: 'sangomaconnect', users: selectUsers },
				function (data) {
					if (data.status) {
						$table.bootstrapTable('refresh')
						if (data.usersToBeProcessed === data.usersProcessed) {
							$bulkTopMessage.html('All users were successfully enabled!')
							$bulkTopMessage.show()
							selectUsers = []
							setTimeout(function () { window.location.reload() }, 5000)
						} else {
							$('#bulkTopMessage').removeClass("alert-success");
							$('#bulkTopMessage').addClass("alert-warning");
							let message = "";
							if (data.message) {
								message = _('Some users cannot be enabled, Due to ' + data.message);
								// displaying message on modal
								$this.find('span').text(_('Enable Users'));
								$this.prop('disabled', false);
								$('.dynamic', $dynamicModal).hide()
								$('.modal-body.server-error p', $dynamicModal).html(
									message || 'Something went wrong!'
								)
								$('.server-error', $dynamicModal).show()
								$dynamicModal.modal('show');
								message = _("Some users cannot be enabled..!!");
							} else {
								message = _('Some users cannot be enabled, please check them individually in Userman -> Sangoma Talk tab.');
								if(data.usersProcessed) {
									message = _(message + "</br></br> Successfully enabled " + data.usersProcessed + " users.");
								}
								if(data.usersToBeProcessed - data.usersProcessed) {
									message = _(message + "</br></br>" + (data.usersToBeProcessed - data.usersProcessed) + " users cannot be enabled.</br> Errors and their meaning:</br>noEmail = user doesn't have any email.</br>noExtension = user not linked with any extension.</br>noPjsip = the linked extension to the user is not a Pjsip extension.</br>duplicatedEmail = user email is duplicated.</br>noEpm = extension is not registered under Endpoint Manager.</br></br>List of users and reasons which are not enabled:</br>");
									if (data.disabledUsers != "undefined") {
										$.each(data.disabledUsers, function(index, item) {
											message += _(item + '</br>');
										});
									}
								}
								if (data.disabledUsernames != "undefined") {
									$("#table-all-users").removeClass("table-striped");
									$.each(data.disabledUsernames, function(index, item) {
										$("#table-all-users tr td").filter(function() {
											return $(this).text() == item;
										}).parent('tr').addClass('danger');
									});
								}
							}
							$bulkTopMessage.html(message);
							$bulkTopMessage.show();
						}
						$this.find('span').text(_('Enable Users'));
						$this.prop('disabled', false);
					} else {
						$this.find('span').text(_('Enable Users'));
						$this.prop('disabled', false);
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html(
							data.message || 'Something went wrong!'
						)
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(data)
					}
				}
			)
		})
		$dynamicModal.modal('show')
	})

	$("#user-type").change(function () {
		var val = $(this).val();
		$removeButton.prop('disabled', true)
		$inviteButton.prop('disabled', true)
		$("#table-all").bootstrapTable('refresh', { url: 'ajax.php?module=sangomaconnect&command=' + val });
		if (val === 'userlist') {
			$("#table-all").bootstrapTable('showColumn', 'auth_status');
			$("#invite-all").show();
		} else {
			$("#table-all").bootstrapTable('hideColumn', 'auth_status');
			$("#invite-all").hide();
		}
	});

	$("#enable-user-type").change(function () {
		var val = $(this).val();
		if (val == 'alluserlist') {
			$('#bulk_enable_info').html(_('Only the users linked with a PJSIP extension is listed here, because Sangoma Mobile/Desktop Applications only support PJSIP extension linked users.'));
		} else {
			$('#bulk_enable_info').html(_('Sangoma Talk enabled users are listed here. Sangoma Phone Desktop Client login can be enabled only for Sangoma Talk enabled users.'));
		}
		$enableButton.prop('disabled', true);
		$("#table-all-users").bootstrapTable('refresh', { url: 'ajax.php?module=sangomaconnect&command=' + val });
	});

	$('.dynamic-close-button', $dynamicModal).on('click', () => {
		$dynamicModal.modal('hide')
	})

	$installSSl.on('click', function () {
		var $this = $(this)
		var action = $('#domain-action-selector option:selected').val()
		$ssllink.attr('disabled', true)
		var perc = 0
		$('#domainaction').modal('hide')
		var cfmMessage = _(
			'This will disconnect all Sangoma Talk users and reset the Sangoma Talk service. Are you sure?'
		)
		// action == 2 == remove certificates
		if (action == '2') {
			cfmMessage = _(
				'This will disconnect all Sangoma Talk users and stop the Sangoma Talk service. Are you sure?'
			)
		}
		if (confirm(cfmMessage)) {
			$('.progress-bar').css('width', '')
			$('.progress').removeClass('hidden')
			$('.progress-bar').addClass('active')
			var timer = setInterval(function () {
				perc += 2
				$('.progress-bar').css('width', perc + '%')
			}, 5000)
			$.post(
				'ajax.php',
				{ command: 'generateSSL', module: 'sangomaconnect', action: action },
				function (data) {
					clearInterval(timer)
					$('.progress-bar').css('width', '100%')
					$('.progress-bar').removeClass('active')
					$ssllink.attr('disabled', false)
					$('#domainaction').modal('hide')
					window.location.reload()
				}
			).always(function () {
				clearInterval(timer)
				$('.progress-bar').removeClass('active')
				$ssllink.attr('disabled', false)
				$('#domainaction').modal('hide')
			})
		} else {
			$ssllink.attr('disabled', false)
		}
	})

	$advancedSettingsSave.on('click', function () {
		let formError = false;
		$("tr[id^='emergency_location_'] input").each(function() {
			if ($(this).val()) {
				if ($(this).hasClass('form-error')) {
					$(this).removeClass('form-error');
				}
			} else {
				formError = true;
				if (!$(this).hasClass('form-error')) {
					$(this).addClass('form-error');
				}
			}
		});
		if (formError) {
			fpbxToast(_("Please fill the required fields."),_("Error"),'error');
			return false;
		}
		var defaultFQDN = $('#SANGOMACONNECTSECURECALLSFQDN').val();
		var defaultTransport = $('#SANGOMACONNECTDEFAULTTRANSPORT').val();
		var displayName = $('#SANGOMACONNECTDISPLAYNAME').val();
		var ecallRoute = $('#SANGOMACONNECTECALLSROUTE').val();
		var useDNSSRVRecord = $("input[name=SANGOMACONNECTDNSSRVRECORD]:checked").val();
		var useTLSWITHSIP = $("input[name=SANGOMACONNECTTLSWITHSIP]:checked").val();
		var scdIpAddress = $("#scdIpAddress").val();
		var defaultCC = $('#SANGOMACONNECTCC').val();
		var eNumbersArr = [];
		var show_chat_status = $("input[name=show_chat_status]:checked").val();
		var attachments_max_disk_size = $("#attachments_max_disk_size").val();
		var attachments_max_size = $("#attachments_max_size").val();
		var chat_retention_days = $("#chat_retention_days").val();
		var hide_queue_from_contacts = $("input[name=hide_queue_from_contacts]:checked").val();
		$eNumbers = $("#SANGOMACONNECTENUMBERS input[name^='SANGOMACONNECTENUMBER[']");
		$eNumbers.each(function (index) {
			eNumbersArr.push($(this).val());
		});
		let emergencyLocations = [];
		$("tr[id^='emergency_location_']").each(function() {
			let location = {};
			$(this).find("input").each(function() {
				location[$(this).attr('name')] = $(this).val();
			});
			emergencyLocations.push(location);
		});

		$.post(
			'ajax.php',
			{
				command: 'saveSettings',
				module: 'sangomaconnect',
				defaultFQDN: defaultFQDN,
				defaultTransport: defaultTransport,
				displayName: displayName,
				eNumbers: eNumbersArr,
				ecallRoute: ecallRoute,
				useDNSSRVRecord: useDNSSRVRecord,
				scdIpAddress: scdIpAddress,
				showBlf: $("input[name=show_blf]:checked").val(),
				showPresenceStatus: $("input[name=show_presence_status]:checked").val(),
				show_chat_status: show_chat_status,
				attachments_max_disk_size: attachments_max_disk_size,
				attachments_max_size: attachments_max_size,
				chat_retention_days: chat_retention_days,
				add_dial_prefix: $("input[name=add_dial_prefix]:checked").val(),
				hide_queue_from_contacts: hide_queue_from_contacts,
				forces_pinsets_answer: $("input[name=forces_pinsets_answer]:checked").val(),
				defaultCC: defaultCC,
				scd_callpopup: $("input[name=scd_callpopup]:checked").val(),
				scd_prefix_to_remove: $("#scd_prefix_to_remove").val(),
				scd_makingcallswith: $("input[name=scd_makingcallswith]:checked").val(),
				emergencyLocations: emergencyLocations,
				useTLSWITHSIP: useTLSWITHSIP,
				contactDisplayPreference: $('#contact_display_preference').val(),
			},
			function (data) {
				if (data.status) {
					alert('Settings saved succesfully')
					setTimeout(function () { window.location.reload() }, 5000)
				} else {
					alert(data.message)
				}
			}
		)
	})

	$resetServer.on('click', function () {
		let $this = $(this),
			action = $(this).attr('data-action'),
			request = function (action) {
				$.ajax({
					url: 'ajax.php',
					type: 'GET',
					data: { command: action, module: 'sangomaconnect' },
					success: result => {
						if (result.status) window.location.reload()
						else {
							$this.attr('disabled', false)
							$('.dynamic', $dynamicModal).hide()
							$('.modal-body.server-error p', $dynamicModal).html(
								result.message || 'Something went wrong!'
							)
							$('.server-error', $dynamicModal).show()
							$dynamicModal.modal('show')
							console.error(result)
						}
					},
					error: error => {
						$this.attr('disabled', false)
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html(
							error.message || 'Something went wrong!'
						)
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(error)
					}
				})
			}
		$this.attr('disabled', true)
		if (action == 'stop-server') {
			$('.dynamic', $dynamicModal).hide()
			$('.modal-body.server-warning p', $dynamicModal).html(
				'<strong>Are you sure you want to disable Sangoma Talk?</strong><br/>' +
				'<br/>Sangoma Talk provisioning and directory will be disabled<br/>' +
				'Users will not be able to log into the Sangoma Talk mobile device<br/>' +
				'Existing logged in users will still be able to make calls'
			)
			$('.server-warning', $dynamicModal).show()
			$('#dynamic-action-button', $dynamicModal).one('click', () => {
				request(action)
			})
			$('.dynamic-close-button', $dynamicModal).one('click', () => {
				$dynamicModal.modal('hide')
				$this.attr('disabled', false)
			})
			$dynamicModal.modal('show')
		} else {
			request(action)
		}
	})

	$("input[name=scd_callpopup]").on('change', function () {
		if ($("input[name=scd_callpopup]:checked").val() == 'yes') {
			$("#scd_prefix_to_remove").prop('disabled', false);
		} else {
			$("#scd_prefix_to_remove").prop('disabled', true);
		}
	});

	return {
		toggleFollowme: function (id) {
			let $this = $('#' + id),
				extension = $this.attr('value'),
				state = $this.is(':checked') ? 'enable' : 'disable'
			$.ajax({
				url: 'ajax.php',
				type: 'GET',
				data: {
					command: 'toggleFM',
					module: 'findmefollow',
					extdisplay: extension,
					state: state
				},
				success: function (data) {
					if (data.return) {
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-success p', $dynamicModal).html(
							"'Follow me' has been " +
							state +
							'd properly on extension ' +
							extension
						)
						$('.server-success', $dynamicModal).show()
						$dynamicModal.modal('show')
					} else {
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html(
							'Not able to ' + state + " 'Follow me' for extension " + extension
						)
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(data)
					}
				},
				error: function (err) {
					$('.dynamic', $dynamicModal).hide()
					$('.modal-body.server-error p', $dynamicModal).html(
						'Something wrong happened when ' +
						state +
						"ing 'Follow me' for extension " +
						extension
					)
					$('.server-error', $dynamicModal).show()
					$dynamicModal.modal('show')
					console.error(err)
				}
			})
		},
		sendinvite: function (id, extension) {
			let $this = $('#pwmlink' + id),
				$icon = $('.fa-envelope-o', $this)
			if (
				!extension ||
				(typeof extension == 'string' && extension.trim() == 'none')
			) {
				$('.dynamic', $dynamicModal).hide()
				$('.modal-body.server-error p', $dynamicModal).html(
					'Cannot invite user. Please make sure the user has a default extension.'
				)
				$('.server-error', $dynamicModal).show()
				$dynamicModal.modal('show')
			} else {
				$icon.addClass('animate')
				$this.attr('disabled', true)
				$.ajax({
					url: 'ajax.php',
					type: 'POST',
					data: {
						command: 'generateTmpPwd',
						module: 'sangomaconnect',
						user: id
					},
					success: result => {
						$icon.removeClass('animate')
						$this.attr('disabled', false)
						if (result.status) {
							$('.dynamic', $dynamicModal).hide()
							$('.modal-body.server-success p', $dynamicModal).html(
								'Invitation has been sent to the user'
							)
							$('.server-success', $dynamicModal).show()
							$dynamicModal.modal('show')
							$table.bootstrapTable('refresh');
						}
					},
					error: error => {
						$icon.removeClass('animate')
						$this.attr('disabled', false)
						$('.dynamic', $dynamicModal).hide()
						$('.modal-body.server-error p', $dynamicModal).html('Server Error')
						$('.server-error', $dynamicModal).show()
						$dynamicModal.modal('show')
						console.error(error)
					}
				})
			}
			return true
		}
	}
})(jQuery, window, document)

function setTooltip(btn, message) {
	btn.setAttribute('title', message);
}

var clipboard = new ClipboardJS('.loginlink');
clipboard.on('success', function (e) {
	e.clearSelection();
	setTooltip(e.trigger, 'Copied!');
});

clipboard.on('error', function(e) {
	setTooltip(e.trigger, 'Failed to Copy!');
});

$('.loginlink').mouseleave(function(e) {
	e.currentTarget.removeAttribute('title');
});

function userActions(value, row, index) {
	var WarningMsgForSCD = '';
	var alertMsg = `Are you sure you want to disable Desktop Phone Setup Wizard for the selected user? ` + scdAlert;
	var html =
		'<a href="?display=userman&action=showuser&user=' +
		row.id +
		'#usermanhooksangomaconnect"><i class="fa fa-edit"></i></a>'
	if ($("#user-type").val() == 'userlist') {
		if (row.hasOwnProperty('webrtcEnabled') && row.webrtcEnabled == '1') {
			WarningMsgForSCD = 'Sangoma Phone Desktop Client is already enabled for the selected user. ' + talkAlert;
		}
		alertMsg = 'Are you sure you want to disable Sangoma Talk for the selected user?' + WarningMsgForSCD;
		html +=
			'<a data-pwuid="' +
			row.id +
			'" data-tmppwd="' +
			row.temp_password +
			'" data-target="#invitemodal" id="pwmlink' +
			row.id +
			'" class="clickable" onclick="return scope.sendinvite(' +
			row.id +
			",'" +
			row.default_extension +
			'\')" ><i class="fa fa-envelope-o"></i></ a >'

		html += '<a data-toggle="modal" data-temp_password="' +
			row.temp_password +
			'" data-target="#viewloginlink" id="viewlinkmodal' +
			row.id + '" class="clickable"><i class="fa fa-eye"></i></a>'
	}

	html +=
		'&nbsp;<a href="?display=sangomaconnect&action=remove&id=' +
		row.id +
		'" class="removeUser" onclick="return confirm(\'' + alertMsg.replace(/'/g, "\\'") + '\')"><i class="fa fa-trash"></i></a>'
	//html += '<a class="clickable"><i class="fa fa-trash-o" data-section="all" data-id="'+row.id+'"></i></a>';
	return html
}

function followmeCell(value, row, index) {
	if (row.default_extension && row.default_extension != 'none')
		return (
			'<input type="checkbox" id="followme-' +
			row.id +
			'" onclick="return scope.toggleFollowme(\'followme-' +
			row.id +
			'\')" ' +
			(value ? 'checked' : '') +
			' value="' +
			row.default_extension +
			'" />'
		)
	else return '-'
}

function addNumber() {
	lastid = $("#SANGOMACONNECTENUMBERS tr[id^=\"SANGOMACONNECTENUMBER_\"]:last-child").attr("id");
	if (lastid) {
		index = lastid.substr(6);
		index++;
	} else {
		index = 0;
	}

	row = "<tr id=\"SANGOMACONNECTENUMBER_" + index + "\" class='emergencyrow'>";
	row += "<td class='emergencynu'>";
	row += "<a class=\"clickable\" onclick=\"delNumber(" + index + ")\"><i class=\"fa fa-ban fa-fw\"></i></a>";
	row += "</td>";
	row += "<td>";
	row += "<input class=\"form-control\" type=\"number\" name=\"SANGOMACONNECTENUMBER[" + index + "]\" value=\"\"/>";
	row += "</td>";

	$("#SANGOMACONNECTENUMBERS").append(row);
}

function delNumber(index) {
	$("#SANGOMACONNECTENUMBER_" + index).remove();
}

function addLocation() {
	let lastId = $("#emergency_locations tr[id^='emergency_location_']:last-child").attr("id");
	let index = 0;
	if (lastId) {
		index = lastId.replace('emergency_location_', '');
		index++;
	}

	row = '<tr id="emergency_location_' + index + '" class="emergencyrow">';
	row += '<input type="hidden" name="location_id" value="0">';
    row += '<td class="emergencynu"><a class="clickable" onclick="deleteLocation(' + index + ', 0)"><i class="fa fa-ban fa-fw"></i></a></td>';
    row += '<td><input type="text" class="form-control" name="location_name" value="" placeholder="Location Name"></td>';
    row += '<td><input type="text" class="form-control number-only" name="out_cid" value="" placeholder="Outgoing Caller ID Number"></td>';
    row += '</tr>';

	$("#emergency_locations").append(row);
}

function deleteLocation(index, locationId) {
	if (locationId != 0) {
		$.post(
			'ajax.php',
			{
				command: 'deleteEmergencyLocations',
				module: 'sangomaconnect',
				locationId: locationId,
			},
			function (data) {
				if (data.status) {
					$("#emergency_location_" + index).remove();
				}
				alert(data.message)
			}
		)
	} else {
		$("#emergency_location_" + index).remove();
	}
}

$(document).on('keypress', '.number-only', function (e) { 
	if (String.fromCharCode(e.which).match(/[^0-9]/g)) {
		return false;
	}
});


var stepFlag1 =stepFlag2=stepFlag3= false;$socketErrorCheckFlag=0;userLimit = 0;activeUsers = 0;$continueFlag =0
let isApiCalledForStep0 = false; let firstCheck = false;userErrorMsgFlag = 0;
var getUserList = [];superviosorUsers = [];continueFlag = 0;deleteReloadFlag = 0;
var wizardType='enable_scd';
        $(document).ready(function () {
            loadPlugIn();
			$('#wizard_text_sng_queue_permissions-help').hide();
			// $('[data-toggle="tooltip"]').tooltip()
			$('#wizard_sng_queue_permissions-help').click(function () {
				$('#wizard_text_sng_queue_permissions-help').toggle();
				let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
				let windowHeight = $(window).height();
				let adjustHeight = windowHeight - modalHeight;
				$('#sangomaModal .modal-dialog').addClass('modal-lg');
				adjustContainerHeight();
				$('#wizard_text_sng_call_monitoring_permissions-help').hide();
			});		
			
			$('#wizard_text_sng_call_monitoring_permissions-help').hide();
			$('#wizard_sng_call_monitoring_permissions-help').click(function () {
				$('#wizard_text_sng_queue_permissions-help').hide();
				$('#wizard_text_sng_call_monitoring_permissions-help').toggle();
				let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
				let windowHeight = $(window).height();
				let adjustHeight = windowHeight - modalHeight;
				$('#sangomaModal .modal-dialog').addClass('modal-lg');
				adjustContainerHeight();
			});
        });

		$('#sangomaTrigger').on('click',function (e) {
			e.stopPropagation();
			wizardType='enable_scd';
			userErrorMsgFlag = 1;
			initializeSmartWazrd();
			editBulk('sangomaTrigger');
			$('#sangomaModal').modal('show');
			$('#systemvalidationTable').css('height', '400px');
			$('.wizardtittle').text("Sangoma Desktop Phone Setup Wizard");
			$(".step1Tittle").text("Step 1 : System Prerequisites Validation");
			$(".step2Tittle").text("Step 2 : Enable Users (Users with email and extension)");
			systemChecks();
			$('.listUsers').css('display','none');
		});
		$('#bulkTrigger').click(function (e) {
			e.preventDefault();
			wizardType='enable_supervisor';
			e.stopPropagation();
			userErrorMsgFlag = 2;
			initializeSmartWazrd();
			editBulk('bulkTrigger');
			$('#sangomaModal').modal('show');
			$('.wizardtittle').text("Sangoma Desktop Phone Supervisor Wizard");
			$(".step1Tittle").text("Step 1 : Queue Supervisor prerequisites validation");
			$(".step2Tittle").text("Step 2 : Enable Supervisor Users");
			systemcheckfor_enablesupervisor();
			$('#systemvalidationTable').css('height', 'auto');
			$('.listUsers').css('display','block');
			supervisorPermissionFlag = 1;
		});

		function initializeSmartWazrd(){
			$('#smartwizard').smartWizard({
				selected: 0,
				theme: 'default',
				justified: true,
				autoAdjustHeight: true,
				transition: { animation: 'fade', speed: 400 },
				toolbar: {
				  showNextButton: true,
				  showPreviousButton: true,
				  position: 'bottom',
				  extraHtml: `<button class="btn btn-success createuser" onclick="onCreate()" >Enable</button>
				  <button class="btn btn-success submit" onclick="onCreatePermisionofuser(event)" >Save permissions</button>
				  <button class="btn btn-success finish" onclick="onFinish()" >Finish</button>`,
				},
				anchor: {
					enableNavigation: false,
					anchorClickable:false,   
					enableNavigationAlways: false,
					enableDoneState: true,
					markPreviousStepsAsDone: true,
					unDoneOnBackNavigation: false, 
					enableDoneStateNavigation: false,
					removeDoneStepOnNavigateBack: false,
					enableAnchorOnDoneStep: true
				},
			  });

			  const nextButton = document.querySelector('.sw-btn-next');
			  if(nextButton){
					nextButton.classList.add('btn');
					nextButton.setAttribute('style', 'border: 2px solid rgba(94, 156, 125, 0.9) !important; background: #d6e4dd !important; color: #0f5a59 !important;font-weight: bolder');
				}

				const prevButton = document.querySelector('.sw-btn-prev');
				if(prevButton){
					nextButton.classList.add('btn');
					prevButton.setAttribute('style', 'border: 2px solid rgba(94, 156, 125, 0.9) !important; background: #d6e4dd !important; color: #0f5a59 !important;font-weight: bolder');
					$('.sw-btn-prev').removeAttr('disabled');
				  }	
		}

function editBulk(id){
	if(id){
		if(id == 'sangomaTrigger'){
			$('#smartwizard .nav-item').eq(2).hide();
			$('#smartwizard .tab-pane').eq(2).hide(); 
		}else if(id == 'bulkTrigger'){
			$('#smartwizard .nav-item').eq(2).show();
			$('#smartwizard .tab-pane').eq(2).hide();
		}
	}
	$('#smartwizard').smartWizard("toolbar").find('button.finish').hide();
	$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
	$('#smartwizard').smartWizard("toolbar").find('button.submit').hide();
	setupCustomStepValidation(id);
	$('#smartwizard').smartWizard("goToStep", 0);
}

function onFinish(){
	let currentStepIndex = $('#smartwizard .nav-link.active').parent().index();
	step = currentStepIndex;
	if(step==1){
		$('.systemvalidation').css(
			{
				"pointer-events": "unset",
				"opacity": "1"
			}
		);
	}
	$('.closebtn').removeAttr("disabled");
	if(validateSteps(step)){
		$('#smartwizard').smartWizard("reset");
		$('#smartwizard').smartWizard("goToStep", 0);
		$('#sangomaModal').modal('hide');
		$('#smartwizard .nav-item:nth-of-type(1)').css('opacity', '1');
		$('#smartwizard .nav-item:nth-of-type(2)').css('opacity', '0.3');
		$('#smartwizard .nav-item:nth-of-type(3)').css('opacity', '0.3');
		if(step == 1 || step == 2){
			if($continueFlag == 1){
				window.location.reload()
			}
			$continueFlag = 0;
		}
		$('#queuepermissions').empty();
		$('#grouppermissions').empty();
		if(step == 2){
			if(deleteReloadFlag == 1){
				window.location.reload()
			}
			deleteReloadFlag = 0;
		}
	}else{
		alert("Please complete all the steps before you finish");
	}
	getUserList = [];
	keepSelectedRows.clear();
	payLoad = [];
	quesueOptions = [];
	groupOptions = [];
	groupPayLoad = [];
	addGroupCount = 1;
	addQueueCount = 1;
	selectedUser = 1;
	$('.systemvalidation').css(
		{
			"pointer-events": "unset",
			"opacity": "1"
		}
	);
	$('.supervioserEnableUsers').css(
		{
			"pointer-events": "unset",
			"opacity": "1"
		}
	);
	$('#listscduserstable').bootstrapTable('resetSearch', '');
}

function onCancel(){
	let currentStepIndex = $('#smartwizard .nav-link.active').parent().index();
	step = currentStepIndex;
	$('#smartwizard').smartWizard("reset");
	$('#smartwizard').smartWizard("goToStep", 0);
	$('#sangomaModal').modal('hide');
	$('#smartwizard .nav-item:nth-of-type(1)').css('opacity', '1');
	$('#smartwizard .nav-item:nth-of-type(2)').css('opacity', '0.3');
	$('#smartwizard .nav-item:nth-of-type(3)').css('opacity', '0.3');
	$('#smartwizard').smartWizard("toolbar").find('button.finish').hide();
	$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
	$('#smartwizard').smartWizard("toolbar").find('button.submit').hide();
	$('.checkusers').css('opacity','1');
	$('#listscduserstable').css('opacity','1');
	$('.displayCount').css('display','none');
	$('.sw-toolbar-elm').css('position','unset');
	$('.sw-toolbar-elm').css('z-index','0');
	$('#queuepermissions').empty();
	$('#grouppermissions').empty();
	getUserList = [];
	keepSelectedRows.clear();
	queuerow = 1;
	grouprow = 1;
	superviosorUsers = [];
	groupPayLoad = [];
	payLoad= [];
	quesueOptions = [];
	groupOptions = [];
	addGroupCount = 1;
	addQueueCount =1;
	if(step == 2){
		if($continueFlag == 1){
			window.location.reload()
		}
		$continueFlag = 0;
	}
	if($continueFlag == 1){
		$continueFlag = 0;
	}else{
		$continueFlag = 0;
	}
	selectedUser = 1;
	$('.supervioserEnableUsers').css(
		{
			"pointer-events": "unset",
			"opacity": "1"
		}
	);
	$('.fa-spin').css('display','none');
	$('#listscduserstable').bootstrapTable('resetSearch', '');
	if(step == 2){
		if(deleteReloadFlag == 1){
			window.location.reload()
		}
		deleteReloadFlag = 0;
	}
	deleteReloadFlag = 0;
}



function setupCustomStepValidation(id){
	$("#smartwizard").off("leaveStep").on("leaveStep", function(e, anchorObject, currentStepIndex, nextStepIndex, stepDirection) {
		if(stepDirection == 'forward'){
			const val = validateSteps(currentStepIndex)
			if(!val){
				e.preventDefault();
			}
		}if(stepDirection == 'backward'){
			$('#smartwizard .nav-item').css('opacity', '0.3');
			$(`#smartwizard .nav-item:nth-of-type(${currentStepIndex})`).css('opacity', '1');
		}
	});
	 //show Finish button
	 $("#smartwizard").off("showStep").on("showStep",function(e,anchorObject,currentStepIndex,nextStepIndex,stepDirection){
		 let getSteps = $('#smartwizard .nav-item').length-1; 
		 if (currentStepIndex === 0 && isApiCalledForStep0 == false) {
            // Call the API to fetch data and display it
			if (wizardType =='enable_scd') systemChecks();
			if (wizardType =='enable_supervisor') systemcheckfor_enablesupervisor();

			isApiCalledForStep0 = true;
			firstCheck = true;
        }
		 if(id=='sangomaTrigger'){
			if(currentStepIndex == 1){
            //    $('#smartwizard').smartWizard("toolbar").find('button.finish').show();
			   $('#smartwizard').smartWizard("toolbar").find('button.createuser').show();
			   $('#smartwizard').smartWizard("toolbar").find('button.sw-btn-next').hide();
			   $('#smartwizard').smartWizard("progress").find('.progress-bar').css('width','100%');
			}else{
				$('#smartwizard').smartWizard("toolbar").find('button.sw-btn-next').show();
				$('#smartwizard').smartWizard("toolbar").find('button.finish').hide();
				$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
				$('#smartwizard').smartWizard("toolbar").find('button.submit').hide();
			}
		 }else if(id == 'bulkTrigger'){
			if(currentStepIndex == getSteps){
				$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
				$('#smartwizard').smartWizard("toolbar").find('button.submit').show();
				$('#smartwizard').smartWizard("toolbar").find('button.sw-btn-next').hide();
				$('#smartwizard').smartWizard("toolbar").find('button.sw-btn-prev').hide();
				$('#smartwizard').smartWizard("progress").find('.progress-bar').css('width','100%');
			 }else{
				$('#smartwizard').smartWizard("toolbar").find('button.sw-btn-next').show();
				$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
				$('#smartwizard').smartWizard("toolbar").find('button.submit').hide();
			 }
		 }
	 });
}

function validateSteps(step){
	let isvalidate=false;
	switch(step){
		case 0: const textval = $('#step-0').val();
		 let checkAll = validateSystemChecks(2);
			if (checkAll == false) {
				return;
			} else {
				$('#smartwizard .nav-item:nth-of-type(1)').css('opacity', '0.3');
				$('#smartwizard .nav-item:nth-of-type(2)').css('opacity', '1');
				isvalidate = true;
			}
			// checkSangomaClientHostAddress();
			if (wizardType =='enable_scd') listAllUsers();
			if (wizardType =='enable_supervisor') listSCDEnabledUsers();
			$('#activeusers').prop('checked', true);
				break;

		case 1:
			isvalidate = false;
					// let users= listAllUsers();
					 superviosorUsers = getUserList;
					if(getUserList.length >0 ){
						//enable users
						$('.fa-spin').css('display','none');
						isvalidate = true;
						getUserList = [];
					}else{
						isvalidate = false;
						getUserList = [];
						alert("Please select users to enable");
						return ;
					}
					$('#smartwizard .nav-item:nth-of-type(1)').css('opacity', '0.3');
					$('#smartwizard .nav-item:nth-of-type(2)').css('opacity', '0.3');
					$('#smartwizard .nav-item:nth-of-type(3)').css('opacity', '1');
					// $('#smartwizard').smartWizard("toolbar").find('button.sw-btn-prev').attr('disabled', 'disabled');
					if (wizardType =='enable_supervisor') getSupervoicePermissions(superviosorUsers);
				break;
		case 2 :
				$('#smartwizard .nav-item:nth-of-type(3)').css('opacity', '1');
				$('#smartwizard .nav-item:nth-of-type(1)').css('opacity', '0.3');
				$('#smartwizard .nav-item:nth-of-type(2)').css('opacity', '0.3');
				// $('#smartwizard').smartWizard("toolbar").find('button.sw-btn-prev').removeAttr('disabled');
				getSupervoicePermissions(superviosorUsers);
				isvalidate = true;
				break;


	}
	return isvalidate;
}
var queueLimit = 0;
function getUserdetailsbyid(id){
	//get user name by id 
	$.get(`/admin/ajax.php?module=sangomaconnect&command=getUserDetailsById&id=${id}`).done(function(response){
		if(response){
			  $('#enableduserid').text(response['default_extension']);
			  $('#enabledusername').text(response['username']);
			  queueLimit = response['queueLimit']; 
		  }
	}).fail(function(error){
		let errorMessage = error.responseJSON;
		fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
	})
}

function validateSystemChecks(flag){
	let allelems = document.querySelectorAll(`#systemvalidationTable tr`);
	if(flag == 1){
		for(row of allelems){
			let getTd = row.querySelector('td i.fa-times');
			console.log(row);
			if(getTd){
				let className = getTd.className;
				let id = getTd.id;
				console.log(id);
				if(id =='hasDefaultCertCheck'){
					let displayError = getTd.getAttribute('data-value');
					return  displayError;
					break;
				}
			}
			continue;
		}
	}else if(flag == 2){
		for(row of allelems){
			let getTd = row.querySelector('td i.fa-times');
			if(getTd){
				let className = getTd.className;
				let id = getTd.id;
				if(id=='addcallactivitygroup'){
					return  true;
				}
				let displayError = getTd.getAttribute('data-value');
				alert(displayError);
				return  false;
				break;
			}
			continue;
		}
	}
}


function loadPlugIn(){
	let href = "https://cdn.jsdelivr.net/npm/smartwizard@6/dist/css/smart_wizard_all.min.css";
	let src  = "https://cdn.jsdelivr.net/npm/smartwizard@6/dist/js/jquery.smartWizard.min.js";
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = href;
	document.head.appendChild(link);
	var script = document.createElement("script");
	script.src = src;
	document.head.appendChild(script);
}

function systemChecks(){
			$('#systemvalidationTable').bootstrapTable('refreshOptions', {
				formatNoMatches: function () {
					return "Fetching the data, please wait...!!";
				}
			});
	var data = 	$.get("/admin/ajax.php?module=sangomaconnect"+"&command=systemChecks")
					.done(function(responseData) {
						const tbody = $('#systemvalidationTable tbody');
						let lenghth = Object.keys(responseData).length;
						if(lenghth > 0){
							tbody.empty();
							let tableData = [];
							for(let key in responseData){
								const data = responseData[key];
								let msg = '';
								if(key == 'socketError'){
									if($socketErrorCheckFlag == 1){
										msg = "Asterisk Builtin mini-HTTP server WebSocket Mode should be PJSIP <span style='color:red'>Please restart Asterisk via CLI using <i>fwconsole restart</i></span>";
										// $('#errormsg').text("Asterisk Builtin mini-HTTP server WebSocket Mode should be PJSIP <span style='color:red'>Please resatrt Asterisk via CLI using <i>fwconsole restart</i></span>");
									}else{
									msg = data.msg;
									}
	
								}else{
									msg = data.msg;
								}
								const row = `
									<tr>
										<td>${msg}</td>
										<td>${data.inputaction}</td>
										<td>${data.action}
									</tr>
								`;
								// tbody.append(row);
								tableData.push({
									systemcheck: msg,
									status: data.inputaction,
									action: data.action
								});
							};
							$('#systemvalidationTable').css('height', '400px'); 
							$('#systemvalidationTable').bootstrapTable('load',tableData);
							updateHeight('step-1');
						}else if(lenghth <=0){
							$('#systemvalidationTable').bootstrapTable('refreshOptions', {
								formatNoMatches: function () {
									return "No matching records found"; // Custom message
								}
							});
						}
					})
					.fail(function(error) {
						let errorMessage = error.responseJSON;
						fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
					});

}

function systemcheckfor_enablesupervisor(){
	$('#systemvalidationTable').bootstrapTable('refreshOptions', {
		formatNoMatches: function () {
			return "Fetching the data, please wait...!!";
		}
	});

	var data = 	$.get("/admin/ajax.php?module=sangomaconnect"+"&command=systemcheckfor_enablesupervisor")
					.done(function(responseData) {
						const tbody = $('#systemvalidationTable tbody');

						let lenghth = Object.keys(responseData).length;
						if(lenghth>0){
							tbody.empty();
							for(let key in responseData){
								const data = responseData[key];
								const row = `
									<tr>
										<td>${data.msg}</td>
										<td>${data.inputaction}</td>
										<td>${data.action}
									</tr>
								`;
								tbody.append(row);
							};
							$('#systemvalidationTable').css('height', 'auto');
							updateHeight('step-2');
						}else if(lenghth <=0){
							$('#systemvalidationTable').bootstrapTable('refreshOptions', {
								formatNoMatches: function () {
									return "No matching records found";
								}
							});
						}
						$('#systemvalidationTable').css('height', 'auto'); 
						updateHeight('step-2');
					})
					.fail(function(error) {
						let errorMessage = error.responseJSON;
						fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
					});

}

 function isChecked(e,id){
	const getElm = document.getElementById(id);
	$('.fa-spin').css('display','block');
	if(id){
	// var result = await	
	validateSysChecks(id);
		if(id=="socketErrorCheck"){
		   $socketErrorCheckFlag =1;
		}
	}
}

function adjustTableLayout() {
    const table = $('#systemvalidationTable');
    table.css('display', 'none'); 
    table[0].offsetHeight; 
    table.css('display', 'block');

    const tbody = table.find('tbody');
    tbody.css('max-height', '300px'); 
}
function adjustTableHeight(countusers) {
	const visibleStep = $(".tab-content .tab-pane.active ");
	const newHeight = visibleStep.outerHeight(true); 
    const table = $('#listscduserstable');
	if(countusers > 10){
		// $('.usersscroll').css('height', '300px'); 
		$('.listscduserstable').css('height', '3o0px');
	}else{
		$('.listscduserstable').css('height', 'auto'); 
	}
}

function updateHeight(id) {
    const visibleStep = $(`#${id}`);
    let tableH = visibleStep.outerHeight(true);
    if (tableH === 0) {
        tableH = 150;
    }
    const newHeight = (tableH + 70);
	// $(".tab-content").css("height", newHeight + " !important");
	$(".stepContainer").height(newHeight); 
    $("#smartwizard").smartWizard("fixHeight");
}

finduserFlag = 0; let findusersearchFlag = false;
		$('#listscduserstable').on('search.bs.table', function (e, text) {
			finduserFlag = 1;
			if(findusersearchFlag) return;
			let userdata = $('#listscduserstable').bootstrapTable('getData');
			if(userdata.length==0){
				$('#listscduserstable').bootstrapTable('refreshOptions', {
					formatNoMatches: function () {
						findusersearchFlag = true;
						return "No matching records found..!"; 
					}
				});
			}
		});
		
async function listAllUsers(){
	$('#listscduserstable').bootstrapTable('refreshOptions', {
		formatNoMatches: function () {
			return "Fetching the data, please wait...!!"; 
		}
	});
	$('#listscduserstable').bootstrapTable('load',[]);
	var data = await	$.get("/admin/ajax.php?module=sangomaconnect"+"&command=scdUsers")
					.done(function(responseData) {
						if(responseData){
							let users = responseData.users;
								$('#usersleft').html(responseData.text);
								userLimit = responseData.userLimit;
								activeUsers = responseData.activeUsers;
								if(users.length > 0){
									$('#listscduserstable').bootstrapTable('load',users);
									$('#listscduserstable').bootstrapTable('resetView');
									adjustTableHeight(users.length);
									updateHeight('step-2');
								}else if(users.length <= 0){
									$('#listscduserstable').bootstrapTable('load',[]);
									adjustTableHeight(users.length);
									updateHeight('step-2');
									$('#listscduserstable').bootstrapTable('refreshOptions', {
										formatNoMatches: function () {
											return "No users with a valid email and extension";
										}
									});
								}
							}
						}).fail(function(error) {
							let errorMessage = error.responseJSON;
							fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
						});
}

var supervisorPermissionFlag = 0;
function listSupervisorUsers(id,val){
	if (id === 'enabledusers') {
		$('#enableEdit').text('Editing');
		$('#enabledusers').prop('checked', true);
		$('#activeusers').prop('checked', false);
		listSCDEnabledUsers(2);
		supervisorPermissionFlag = 2;
	} else if (id === 'activeusers') {
		$('#enableEdit').text('Enabling');
		$('#enabledusers').prop('checked', false);
		$('#activeusers').prop('checked', true);
		listSCDEnabledUsers(1);
		supervisorPermissionFlag = 1;
	}
}

async function listSCDEnabledUsers(flag=1) {
	$('#listscduserstable').bootstrapTable('refreshOptions', {
		formatNoMatches: function () {
			return "Fetching the data please wait...!!"; 
		}
	});
	$('#listscduserstable').bootstrapTable('load',[]);
	var data = await $.get("/admin/ajax.php?module=sangomaconnect"+"&command=scdEnabledUsers&flag="+flag).done(function(responseData) {
			if(responseData){
				let users = responseData.users;
				$('#usersleft').html(responseData.text);
				userLimit = responseData.userLimit;
				activeUsers = responseData.activeUsers;
				if(users.length > 0){
					$('#listscduserstable').bootstrapTable('load',users);
					$('#listscduserstable').bootstrapTable('resetView');
					adjustTableHeight(users.length);
					updateHeight('step-2');
				}else if(users.length <= 0){
					$('#listscduserstable').bootstrapTable('load',[]);
					adjustTableHeight(users.length);
					updateHeight('step-2');
					$('#listscduserstable').bootstrapTable('refreshOptions', {
						formatNoMatches: function () {
							return "There are no new Sangoma Desktop Phone users to enable ..!!";
						}
					});
				}
				
			}
		}).fail(function(error) {
			let errorMessage = error.responseJSON;
			fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
		});
}
let keepSelectedRows = new Set(getUserList);
$('#listscduserstable').on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (e,row) {
	const selectedRows = $('#listscduserstable').bootstrapTable('getSelections');
	let tempUserList = selectedRows.map(row => parseInt(row.id));
	tempUserList.forEach(id => keepSelectedRows.add(id));

	if (e.type === 'check.bs.table' || e.type === 'check-all.bs.table') {
        keepSelectedRows.add(row.id);
    } 
    else if (e.type == 'uncheck') {
        keepSelectedRows.delete(row.id);
    }else if( e.type == 'uncheck-all'){
		keepSelectedRows.clear();
	}

    if (selectedRows.length > 0) {
        $('#selectedUserList').text(`You have selected ${selectedRows.length} users`);
    } else {
        $('#selectedUserList').text('');
    }
	// if(selectedRows.length > 0){
       // validate the users 
	   getUserList = Array.from(keepSelectedRows);

	let checkcount = getUserList.length+activeUsers;
	let checkusercount =  userLimit-activeUsers;
		if(supervisorPermissionFlag == 1){
			if(userLimit == 0){
				alert('Please purchase a supervisor license to enable users.');
				$('#listscduserstable').bootstrapTable('uncheckAll');
			}else if(checkcount > userLimit){
				alert('You cannot add additional users without upgrading your license. Please upgrade to enable multiple users.');
				$('#listscduserstable').bootstrapTable('uncheckAll');
			}
		}
});

$('#listscduserstable').on('post-body.bs.table', function () {
	$('#listscduserstable').bootstrapTable('checkBy', { field: 'id', values: getUserList }); // Re-check selected rows
});

function validateUserToEnable(data){
	const xhr = new XMLHttpRequest();
	document.getElementById('enableCount').textContent = `${data.length}`;
	xhr.open('POST', '/admin/ajax.php?module=sangomaconnect&command=enableDeskUsers', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.withCredentials = true; 
	$('.enabelUserstext').text("Please wait while we enable the selected users.");
	xhr.onprogress = function () {
		const response = xhr.responseText.trim();
		const chunks = response.split('\n\n');
		let  latestData = ''; 
		if(chunks[chunks.length - 1].includes('{"status":true,"message":"Updated Sucessfully"}')){
			latestData = chunks[chunks.length - 2];
		}else{
			latestData = chunks[chunks.length - 1];
		}
		if (latestData.startsWith("data:")) {
			const count = latestData.replace("data:", "").trim();
			document.getElementById('runCount').textContent = count; // Update UI in real-time
		}
	};

	xhr.onload = function () {
		if (xhr.status === 200) {
			$('.closeme').removeAttr('disabled');
			$('.enabelUserstext').text("All selected users have been enabled. In case you encounter a Sangoma Desktop Phone login issue with enabled users, please execute the following command from the CLI: 'fwconsole restart'.");
		} else {
			let errorMessage = xhr.response;
			let erMessage= JSON.parse(errorMessage);
			fpbxToast(_(erMessage.error['message']),_("Error"),'error');
			$('.closebtn').removeAttr("disabled");
		}
	};
	xhr.send(JSON.stringify({ users: getUserList }));
}

function validateSysChecks(id){
	var waitForComplete = 0;
	if (id =='sangomartapiEnabledCheck') {
       // get system status 
	   enableRTModule();
		// now call enable api 
		function enableRTModule(){
				//call api to check the status of module
				recheckStatus = 0;
				$.get("/admin/ajax.php?module=sangomaconnect"+"&command=getModuleStatus&modulename=sangomartapi")
				.done(function(response){
					if(response){
						if(response['message'] != "Error"){
							if(response['message'] == "Not Installed"){
								//if not installed 
								var sysadmin_request_module_updates = {};
								$rtapiflag = 0;
								sysadmin_request_module_updates['sangomartapi'] = {
									action: "force_upgrade",
									track: 'stable',
									version: '',
								}
								if(!jQuery.isEmptyObject(sysadmin_request_module_updates)) {
									urlStr = "config.php?display=modules&action=process&quietmode=1&online=1";
									content_data = $.param( {"modules":sysadmin_request_module_updates} )
								}
								recheckStatus = 1;
							}else if(response['message'] != "Not Installed" || response['message'] != "Enabled"){
								//if installed but disabled
								var sysadmin_request_module_updates = {};
								sysadmin_request_module_updates['sangomartapi'] = {
									action: "enable",
									track: 'stable',
									version: '',
								}
								if(!jQuery.isEmptyObject(sysadmin_request_module_updates)) {
									urlStr = "config.php?display=modules&action=process&quietmode=1&online=1";
									content_data = $.param( {"modules":sysadmin_request_module_updates} )
								}

							}
							$('#moduledialogwrapper').dialog({
								title: 'Status',
								resizable: false,
								modal: true,
								width: 410,
								height: 325,
								keyboard: false,
								open: function (e) {
									$('#moduledialogwrapper').html(_('Loading..' ) + '<i class="fa fa-spinner fa-spin fa-2x">');
									var xhr = new XMLHttpRequest(),
										timer = null;
									xhr.open('POST', urlStr, true);
									xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
									xhr.send(content_data);
									timer = window.setInterval(function() {
										if (xhr.readyState == XMLHttpRequest.DONE) {
											window.clearTimeout(timer);
										}
										if (xhr.responseText.length > 0) {
											if ($('#moduledialogwrapper').html().trim() != xhr.responseText.trim()) {
												$('#moduledialogwrapper').html(xhr.responseText);
												$('#moduleprogress').scrollTop(1E10);
											}
										}
										if (xhr.readyState == XMLHttpRequest.DONE) {
											$('#moduleprogress').css("overflow", "auto");
											$('#moduleprogress').scrollTop(1E10);
											$('#moduleBoxContents a').focus();
										}
									}, 500);
								},
								close: function(e) {
									if(recheckStatus == 1){
										setTimeout(recheckrtapi(),3000);
										 $('.fa-spin').css('display','none');
										 $('.stepContainer').css('opacity','1');
									}else{
										$('.fa-spin').css('display','none');
										$('.stepContainer').css('opacity','1');
										systemChecks();
									}
								}
							});
						}else {
							systemChecks();
						}
					}
				})
				.fail(function(error){
					let errorMessage = error.responseJSON;
					fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
				})
				recheckStatus = 0;
		}

		async function recheckrtapi(){
			$.get("/admin/ajax.php?module=sangomaconnect"+"&command=getModuleStatus&modulename=sangomartapi")
			.done(function(response){
				if(response){
					if(response['message'] == "Disabled"){
						//if installed but disabled
						var sysadmin_request_module_updates = {};
						sysadmin_request_module_updates['sangomartapi'] = {
							action: "enable",
							track: 'stable',
							version: '',
						}
						if(!jQuery.isEmptyObject(sysadmin_request_module_updates)) {
							urlStr = "config.php?display=modules&action=process&quietmode=1&online=1";
							content_data = $.param( {"modules":sysadmin_request_module_updates} )
						}

						$('#moduledialogwrapper').dialog({
							title: 'Status',
							resizable: false,
							modal: true,
							width: 410,
							height: 325,
							keyboard: false,
							open: function (e) {
								$('#moduledialogwrapper').html(_('Loading..' ) + '<i class="fa fa-spinner fa-spin fa-2x">');
								var xhr = new XMLHttpRequest(),
									timer = null;
								xhr.open('POST', urlStr, true);
								xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
								xhr.send(content_data);
								timer = window.setInterval(function() {
									if (xhr.readyState == XMLHttpRequest.DONE) {
										window.clearTimeout(timer);
									}
									if (xhr.responseText.length > 0) {
										if ($('#moduledialogwrapper').html().trim() != xhr.responseText.trim()) {
											$('#moduledialogwrapper').html(xhr.responseText);
											$('#moduleprogress').scrollTop(1E10);
										}
									}
									if (xhr.readyState == XMLHttpRequest.DONE) {
										$('#moduleprogress').css("overflow", "auto");
										$('#moduleprogress').scrollTop(1E10);
										$('#moduleBoxContents a').focus();
									}
								}, 500);
							},
							close: function(e) {
								systemChecks();
							}
						});

					}
				}
			})
			.fail(function(error){
				let errorMessage = error.responseJSON;
				fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
			});
		}

	}else if(id == 'queueCount'){
		$('.fa-spin').css('display','none');
		if (wizardType =='enable_supervisor') systemcheckfor_enablesupervisor();
	}else if(id=='clienthostCheck'){
		let hostaddress = window.location.hostname;
		let clientHost;
		while (clientHost === undefined || (clientHost !== null && clientHost.trim() === "")) {
			clientHost = prompt("Please enter the Sangoma Client host address", hostaddress);
			if (clientHost === null) {
				break;
			}
		}
		if(clientHost.length > 0){
			checkSangomaClientHostAddress(clientHost);
		}else{
			$('.fa-spin').css('display','none');
			$('.stepContainer').css('opacity','1');
		}

	}else {
			 if(id=="sslRestAppsPortErrorCheck" || id=="sangomaPhonePortErrorCheck" || id=="hasDefaultCertCheck"){
				if(id=="sslRestAppsPortErrorCheck" || id=="sangomaPhonePortErrorCheck"){
						let displayError = validateSystemChecks(1);
						if(displayError){
							$('.fa-spin').css('display','none');
							$('.stepContainer').css('opacity','1');
							alert("Please configure HTTPS settings.");
							return;
						}
					}

				fpbxToast(_("Configuration changes are being applied. Please wait while Apache restarts..."),'Saving','success');restart_flag=0;
					h='';
					dest = window.location.protocol + '//' + window.location.hostname +  (window.location.port ? ':' + window.location.port : '') + '/admin/config.php?';
				 $.ajax(
					{
						url:'/admin/ajax.php?module=sangomaconnect&command=validateSysChecks',
						type:'POST',
						data:{id:id},
						error: function(d) { d.suppresserrors = true; window.setTimeout(function() {waitFor(h, dest,waitForComplete)}, 1000); },
						complete: function(d) {
							resp = $.parseJSON(d.responseText);
							if(resp.status == 0){ alert(resp.msg);return ;} 
							waitForComplete = 1;
							window.setTimeout(function() {waitFor(h, dest,waitForComplete)}, 1000); 
						}
					}
				 );
			 }else{
				$.post("/admin/ajax.php?module=sangomaconnect&command=validateSysChecks",{id:id})
				.done(function(responseData){
				  if(responseData){
					  if(responseData.status == false){
						  alert(responseData.msg);
					  }
					  $('.fa-spin').css('display','none');
					  $('.stepContainer').css('opacity','1');
					  if (wizardType =='enable_scd') systemChecks();
					  if (wizardType =='enable_supervisor') systemcheckfor_enablesupervisor();
				  }
			   })
			   .fail(function(error){
					let errorMessage = error.responseJSON;
					fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
			   });
			 }
	}
}

function waitFor(h, dest,waitForComplete) {
	// Try to connect to h. If it fails, sleep for 500msec and try again.
	$.ajax({
		url : dest,
		data: { module: "sangomaconnect", command: "getApacheRestartUpdate"},
		success: function() {
			if(waitForComplete = 1){
				 $('.fa-spin').css('display','none');
				 $('.stepContainer').css('opacity','1');
				 if (wizardType =='enable_scd') systemChecks();
				 if (wizardType =='enable_supervisor') systemcheckfor_enablesupervisor();
			 }

		},
		error: function(d) { d.suppresserrors = true;window.setTimeout(function() {waitFor(h, dest)}, 1000); }
		});
}

function close_module_actions() {
	$('#moduledialogwrapper').dialog('close');
}

function onCreate(){
	if(getUserList.length >0 ){
		//enable users
		$('.fa-spin').css('display','none');
		$('.checkusers').css('opacity','0.3');
		$('#listscduserstable').css('opacity','0.3');
		$('.displayCount').css('display','flex');
		$('.sw-toolbar-elm').css('position','relative');
		$('.sw-toolbar-elm').css('z-index','-1');
		$('.closebtn').attr("disabled", 'disabled');
		validateUserToEnable(getUserList);
	}else{
		alert("Please select users to enable");
	}
}

function okContinue(){
	$('#smartwizard').smartWizard("toolbar").find('button.finish').show();
	$('#smartwizard').smartWizard("toolbar").find('button.createuser').hide();
	$('.checkusers').css('opacity','1');
	$('#listscduserstable').css('opacity','1');
	$('.displayCount').css('display','none');
	$('.sw-toolbar-elm').css('position','unset');
	$('.sw-toolbar-elm').css('z-index','0');
	$('.sw-btn-prev').attr("disabled", 'disabled');
	$('.closebtn').removeAttr('disabled');

	$('.systemvalidation').css(
		{
			"pointer-events": "none",
			"opacity": "0.5"
		}
	);
	$continueFlag = 1;
	$('.systemvalidation').css(
		{
			"pointer-events": "none",
			"opacity": "0.5"
		}
	);
}
var queueList = [];var frompaylaod = []; var groupList = [];
async function getSupervoicePermissions(listUsers){
	 $.get("/admin/ajax.php?module=sangomaconnect"+"&command=getSupervoicePermissions")
		.done(function (response){
			if(response['queueList']){
				queueList = response['queueList'];
				var queuesid  = document.getElementById('queuesid');
			}
			if(response['groupList']){
				groupList = response['groupList'];
				var groupid  = document.getElementById('groupid');
			}
			//list the users one after other
			if(listUsers.length >0 ){
			  getUserdetailsbyid(listUsers[0]);
			  if(supervisorPermissionFlag == 2){
				  getQueuesGroupsById(listUsers[0]);
			  }
			}
			document.getElementById('enableSelectedCount').textContent = `${listUsers.length}`;
			document.getElementById('supervsiorCount').textContent = selectedUser;
		})
		.fail(function (error){
			let errorMessage = error.responseJSON;
			fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
		})
}

function getQueuesGroupsById(id){
	$.get(`/admin/ajax.php?module=sangomaconnect&command=getQueuesGroupsById&id=${id}`)
	.done(function(response){
		getUserQueues = response.queues;
		getUsercall	  = response.groupcall;
		if(getUserQueues.length > 0){
			getUserQueues.forEach(
				function(val,key){
					editQueuePermissions(val.queue,val.val,id);
				}
			);
		}

		if(getUsercall.length > 0){
			getUsercall.forEach(
				function(val,key){
					editGroupPermissions(val.id,val.val,id);
				}
			);
		}

	}).fail(function(error){
		let errorMessage = error.responseJSON;
		fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
	})
}

function onChangeRadio(event,id,queueid){
	let val = $(`#${id}`).val();
	let rowid = `queue_permission_${queueid}`;
	let queuecontrolval = '';
	if(val=='DETAILED_VIEW'){
		let queue_id='queue_permission_2'+queueid;
		document.getElementById(queue_id).removeAttribute('checked');
		document.getElementById(queue_id).checked = false;
		document.getElementById(id).checked = true;
		document.getElementById(id).setAttribute('checked', 'true');
		queuecontrolval = 'DETAILED_VIEW';
	}else if (val=='QUEUE_CALL_CONTROL'){
		queuecontrolval = 'QUEUE_CALL_CONTROL';
		let queue_id='queue_permission_1'+queueid;
		document.getElementById(queue_id).removeAttribute('checked');
		document.getElementById(queue_id).checked = false;
		document.getElementById(id).checked = true;
		document.getElementById(id).setAttribute('checked', 'true');
	}
	payLoad = payLoad.map(function(val,index,payLoad){
		if(val['id']==rowid){
			val['queuecontrol']=queuecontrolval;
		}
		return val;
	})
}

function onChangeGroupPer(event,id,groupid){
	let val = $(`#${id}`).val();
	let rowid = `group_permission_${groupid}`;
	if(val=='VIEW'){
		let group_id='group_permission_2'+groupid;
		document.getElementById(group_id).removeAttribute('checked');
		document.getElementById(group_id).checked = false;
		document.getElementById(id).checked = true;
		document.getElementById(id).setAttribute('checked', 'true');
			groupcontrolval = 'VIEW';
	}else if (val=='MONITOR'){
		groupcontrolval = 'MONITOR';
		let group_id='group_permission_1'+groupid;
		document.getElementById(group_id).removeAttribute('checked');
		document.getElementById(group_id).checked = false;
		document.getElementById(id).checked = true;
		document.getElementById(id).setAttribute('checked', 'true');

	}
	groupPayLoad = groupPayLoad.map(function(val,index,groupPayLoad){
		if(val['id']==rowid){
			val['groupcontrol']=groupcontrolval;
		}
		return val;
	})
}
var selectedUser = 1;
function onCreatePermisionofuser(event){
	let qPerFlag = 0;let gPerFlag =0; frompaylaod = [];
	//once createPermison is cliked than restrict to close model
	$('.closebtn').attr("disabled", 'disabled');
	//check payload is selcted queue and its check option and also check for group as well 
	//get length 
	let queuesItems = Object.keys(payLoad);
	let groupItems  = Object.keys(groupPayLoad);
	//payLoad - queues 
	if(queuesItems.length > 0 || groupItems.length > 0 ){
		if(queuesItems.length > 0){
			for(let key in payLoad){
				if(payLoad[key]['queue'] == ""){
					alert("Please select queue to continue");
					qPerFlag = 0 ;
					return;
				}else{
					qPerFlag = 1;
				}
			}
		}
		if(groupItems.length > 0){
			for(let key in groupPayLoad){
				if(groupPayLoad[key]['group'] == ""){
					alert("Please select group to continue");
					gPerFlag= 0;
					return;
				}else{
					gPerFlag = 1;
				}
			}
		}

		if(gPerFlag == 1 || qPerFlag == 1){
			//create from payload
			let dummyPay1 = {
				'user_id':superviosorUsers[0],
				'queue' : payLoad,
				'group':groupPayLoad
			}
			payLoad = [];
			groupPayLoad = [];
			frompaylaod.push(dummyPay1)
			let remainingUsers = superviosorUsers.shift();
			selectedUser = selectedUser +1;
			enableSupervoiseUsers();
	  		createNewSuperviosepermission(superviosorUsers);
		}
		if(superviosorUsers.length == 0 ){
			// enableSupervoiseUsers();
			$('.supervioserEnableUsers').css(
				{
					"pointer-events": "none",
					"opacity": "0.5"
				}
			);
		}
	}else{
		if(supervisorPermissionFlag == 2){
				//create from payload
				let remainingUsers = superviosorUsers.shift();
				selectedUser = selectedUser +1;
				createNewSuperviosepermission(superviosorUsers);
				if(superviosorUsers.length == 0 ){
					// enableSupervoiseUsers();
					$('.supervioserEnableUsers').css(
						{
							"pointer-events": "none",
							"opacity": "0.5" 
						}
					);
				}
		}else{
			alert("Please select queues and group permissions to continue.");
			$('.closebtn').removeAttr("disabled");
		}
	}

}

function enableSupervoiseUsers(){
	$('.supervioserEnableUsers').css(
		{
			"pointer-events": "none",
			"opacity": "0.5" 
		}
	);
	$('.fa-spin').css('display','block');
	$.ajax({
		url: '/admin/ajax.php?module=sangomaconnect&command=enableSupervoiseUsers', // replace with your server endpoint
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({ data: frompaylaod }),  // wrap the data in an object with the key "data"
		success: function(response) {
			$('.fa-spin').css('display','none');
			$continueFlag = 1;
			// fpbxToast(response.message, _('Success'), 'success');
			$('.closebtn').removeAttr("disabled");
			frompaylaod = [];
		},
		error: function(xhr, status, error) {
			let errorResponse = JSON.parse(xhr.responseText);
			if (errorResponse && errorResponse.error && errorResponse.error.message) {
				errorMessage = errorResponse.error.message;
			}else{
				errorMessage = "Unexcepted error in php ";
			}
			fpbxToast(errorMessage);
			$('.fa-spin').css('display','none');
			$('.closebtn').removeAttr("disabled");
		}
	});	
}

var selectQueuesIds = [];quesueOptions=[];groupOptions=[];
function selectQueues(event,selectId,rowid,secFlag,rowno){
	// event.preventDefault();
	rowno = rowno-1;
	let selectqueueval = $(`#${selectId} :selected`).val(); 
	if(secFlag ==1){
		if(quesueOptions[rowno]){
			quesueOptions[rowno]	= '0';
		}else{
			let queuelen = quesueOptions.length;
			let queList = queueList.length
			if (quesueOptions.includes(0)) {
				quesueOptions = quesueOptions.filter(item => item !== 0);
			}
		}
		updateQueues(selectId,quesueOptions);
		if(selectqueueval && selectqueueval != "Select Queues" ){
			$(`#${selectId} option:selected`).attr("data-selected", "true");
			$(`#${selectId} option:selected`).addClass("highlighted");
			if(quesueOptions[rowno]){
				quesueOptions[rowno]=selectqueueval;
			}else if(!quesueOptions.includes(selectqueueval)){
				quesueOptions.push(selectqueueval);
			}
		}
		payLoad = payLoad.map(function(val,index,payLoad){
			if(val['id']==rowid){
				val['queue']=selectqueueval;
			}
			return val;
		})
	}else if(secFlag == 2){
		if(groupOptions[rowno]){
			groupOptions[rowno]	= '0';
		}else{
			if (groupOptions.includes(0)) {
				groupOptions = groupOptions.filter(item => item != 0);
			}
		}
		updateGroup(selectId,groupOptions);
		if(selectqueueval && selectqueueval != "Select Group" ){
			$(`#${selectId} option:selected`).attr("data-selected", "true");
			$(`#${selectId} option:selected`).addClass("highlighted");

			if(groupOptions[rowno]){
				groupOptions[rowno]=selectqueueval;
			}else if(!groupOptions.includes(selectqueueval)){
				groupOptions.push(selectqueueval);
			}
			// groupOptions.push(selectqueueval);
			groupPayLoad = groupPayLoad.map(function(val,index,groupPayLoad){
				if(val['id']==rowid){
					val['group']=selectqueueval;
				}
				return val;
			})
		}
	}
}

function updateGroup(selectId,groupOptions){
	$(`#${selectId} option`).each(function(){
		let optval = $(this).val();
		$(this).css('background-color', 'unset');
		$(this).removeAttr('disabled');
		if (groupOptions.includes(optval)) {
            $(this).css('background-color', '#c4c6c7');
			$(this).attr('disabled', 'disabled');
        }
	})	
}

function updateQueues(selectId,quesueOptions){
	$(`#${selectId} option`).each(function(){
		let optval = $(this).val();
		$(this).css('background-color', 'unset');
		$(this).removeAttr('disabled');
		if (quesueOptions.includes(optval)) {
            $(this).css('background-color', '#c4c6c7');
			$(this).attr('disabled', 'disabled');
        }
	})	
}

function updateOptions(){
	$(`#${selectId} option#${selectqueueval}`).prop("disabled", true);
	$(`#${selectId} option#${selectqueueval}`).css('background', 'none');
	$(`#${selectId} option#${selectqueueval}`).css('color', 'unset');
}

function createNewSuperviosepermission(users){
	$('.supervioserEnableUsers').css(
		{
			"pointer-events": "unset",
			"opacity": "1"
		}
	);
	if(users.length > 0 ){
		document.getElementById('supervsiorCount').textContent = selectedUser;
		$('#queuepermissions').empty();
		$('#grouppermissions').empty();
		grouprow = 1;
		queuerow = 1;
		addGroupCount =1;
		addQueueCount = 1;
		// if stills users are thier than just update user id and queues list 
		getUserdetailsbyid(users[0]);
		if(supervisorPermissionFlag == 2){
			getQueuesGroupsById(users[0]);
		}
		selectQueuesIds = [];
		quesueOptions = [];
		groupOptions = [];
	}else{
		//show finish button
		$('#smartwizard').smartWizard("toolbar").find('button.finish').show();
		$('#smartwizard').smartWizard("toolbar").find('button.submit').hide();
		$('.closebtn').removeAttr("disabled");
		selectedUser = 1;
		quesueOptions = [];
		groupOptions = [];
	}

}
var queuerow = 1;grouprow=1;addQueueCount = 1;addGroupCount = 1;
var payLoad  = [];groupPayLoad=[];
function addQueuePermissions(){
	$('#sangomaModal').modal("handleUpdate");
	//get the queuelimit per users 
	if(addQueueCount <= queueLimit){
		//re adjust the height of modal
		let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
		let windowHeight = $(window).height();
		let adjustHeight = windowHeight-modalHeight;
		$('#sangomaModal .modal-dialog').addClass('modal-lg');
		if(queuerow == 1){
			$('#queuepermissions').css('display','block');
		}
		let queuehtml = `<tr id="queue_permission_${queuerow}" style="display: flex;column-gap: 6px;">
							<td class="delete-entry col-lg-1 col-md-1 col-1"><a class="clickable" onclick="deleteQueueRow('queue_permission_${queuerow}',1,'select_queue_${queuerow}',${queuerow})"><i class="fa fa-ban fa-fw"></i></a></td>
							<td> <select class="queue-select form-control" id="select_queue_${queuerow}" onclick="selectQueues(event, 'select_queue_${queuerow}', 'queue_permission_${queuerow}',1,${queuerow})"></select></td>
							<td> 
								 <div class=" form-group radioset queuecontrol">
									<input type="radio" id="queue_permission_1${queuerow}" name="queue_permission_1${queuerow}" value="DETAILED_VIEW" checked  onclick="onChangeRadio(event,'queue_permission_1${queuerow}',${queuerow})">
									<label for="queue_permission_1${queuerow}">Detailed View</label>
									<input type="radio" id="queue_permission_2${queuerow}" name="queue_permission_2${queuerow}" value="QUEUE_CALL_CONTROL"  onclick="onChangeRadio(event,'queue_permission_2${queuerow}',${queuerow})">
									<label for="queue_permission_2${queuerow}">Queue Call Control</label>
								 </div>
							</td>
						</tr>`;
		$('#queuepermissions').append(queuehtml)
		//update queues select option as of now 
		updateQueuesSelect(`select_queue_${queuerow}`);
		// create dummy paylaod 
		let payloadrow = `queue_permission_${queuerow}`;
		let dummypayload={
				'queuecontrol':'DETAILED_VIEW',
				'queue':'',
				'id':payloadrow
		}
		payLoad.push(dummypayload);
		adjustContainerHeight();
		queuerow = queuerow+1;
		addQueueCount = addQueueCount +1;
	}else{
		alert("You reached your limit to add queues");
	}
}


function editQueuePermissions(queue,queuecontrol,id){
	$('#sangomaModal').modal("handleUpdate");
	//get the queuelimit per users 
		//re adjust the height of modal
		let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
		let windowHeight = $(window).height();
		let adjustHeight = windowHeight-modalHeight;
		let detailedContolCheck = ''; let viewContolCheck = '';
		if(queuecontrol == 'DETAILED_VIEW'){
			detailedContolCheck = 'checked';
		}else if(queuecontrol == 'QUEUE_CALL_CONTROL'){
			viewContolCheck = 'checked';
		}
		$('#sangomaModal .modal-dialog').addClass('modal-lg');
		if(queuerow == 1){
			$('#queuepermissions').css('display','block');
		}
		let queuehtml = `<tr id="queue_permission_${queuerow}" style="display: flex;column-gap: 6px;">
							<td class="delete-entry col-lg-1 col-md-1 col-1"><a class="clickable" onclick="deleteQueueRow('queue_permission_${queuerow}',1,'select_queue_${queuerow}',${queuerow},'edit',${id})"><i class="fa fa-ban fa-fw"></i></a></td>
							<td> <select class="queue-select form-control" id="select_queue_${queuerow}" onclick="selectQueues(event, 'select_queue_${queuerow}', 'queue_permission_${queuerow}',1,${queuerow})"></select></td>
							<td> 
								 <div class=" form-group radioset queuecontrol">
									<input type="radio" id="queue_permission_1${queuerow}" name="queue_permission_1${queuerow}" value="DETAILED_VIEW" ${detailedContolCheck}  onclick="onChangeRadio(event,'queue_permission_1${queuerow}',${queuerow})">
									<label for="queue_permission_1${queuerow}">Detailed View</label>
									<input type="radio" id="queue_permission_2${queuerow}" name="queue_permission_2${queuerow}" value="QUEUE_CALL_CONTROL" ${viewContolCheck} onclick="onChangeRadio(event,'queue_permission_2${queuerow}',${queuerow})">
									<label for="queue_permission_2${queuerow}">Queue Call Control</label>
								 </div>
							</td>
						</tr>`;
		$('#queuepermissions').append(queuehtml);
		//update queues select option as of now 
		updateQueuesSelect(`select_queue_${queuerow}`,queue.trim());
		selectQueues('', `select_queue_${queuerow}`, `queue_permission_${queuerow}`,1,`${queuerow}`)
		// create dummy paylaod 
		let payloadrow = `queue_permission_${queuerow}`;
		let dummypayload={
				'queuecontrol':queuecontrol,
				'queue':queue.trim(),
				'id':payloadrow
		}
		payLoad.push(dummypayload);
		adjustContainerHeight();
		queuerow = queuerow+1;
		addQueueCount = addQueueCount +1;
}


function editGroupPermissions(call,callcontrol,id){
	$('#sangomaModal').modal("handleUpdate");
		//re adjust the height of modal
		let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
		let windowHeight = $(window).height();
		let adjustHeight = windowHeight-modalHeight;
		let detailedContolCheck = ''; let viewContolCheck = '';
		if(callcontrol == 'VIEW'){
			detailedContolCheck = 'checked';
		}else if(callcontrol == 'MONITOR'){
			viewContolCheck = 'checked';
		}
		$('#sangomaModal .modal-dialog').addClass('modal-lg');
		if(grouprow == 1){
			$('#grouppermissions').css('display','block');
		}
		let grouphtml = `<tr id="group_permission_${grouprow}" style="display: flex;column-gap: 6px;">
							<td class="delete-entry col-lg-1 col-md-1 col-1"><a class="clickable" onclick="deleteQueueRow('group_permission_${grouprow}',2,'select_group_${grouprow}',${grouprow},'edit',${id})"><i class="fa fa-ban fa-fw"></i></a></td>
							<td> <select class="queue-select form-control" id="select_group_${grouprow}" onclick="selectQueues(event, 'select_group_${grouprow}', 'group_permission_${grouprow}',2,${grouprow})"></select></td>
							<td> 
								 <div class=" form-group radioset groupcontrol">
									<input type="radio" id="group_permission_1${grouprow}" name="group_permission_1${grouprow}" value="VIEW" ${detailedContolCheck}  onclick="onChangeGroupPer(event,'group_permission_1${grouprow}',${grouprow})">
									<label for="group_permission_1${grouprow}">View</label>
									<input type="radio" id="group_permission_2${grouprow}" name="group_permission_2${grouprow}" value="MONITOR" ${viewContolCheck} onclick="onChangeGroupPer(event,'group_permission_2${grouprow}',${grouprow})">
									<label for="group_permission_2${grouprow}">MONITOR</label>
								 </div>
							</td>
						</tr>`;
		$('#grouppermissions').append(grouphtml)
		//update queues select option as of now 
		updateGroupSelect(`select_group_${grouprow}`,call);
		// selectQueues('', `select_queue_${queuerow}`, `queue_permission_${queuerow}`,1,`${queuerow}`)
		selectQueues('', `select_group_${grouprow}`, `group_permission_${grouprow}`,2,`${grouprow}`)
		// create dummy paylaod 
		let payloadrow = `group_permission_${grouprow}`;
		let dummypayload={
				'groupcontrol':callcontrol,
				'group':call,
				'id':payloadrow
		}
		groupPayLoad.push(dummypayload);
		adjustContainerHeight();
		grouprow = grouprow+1;
		addGroupCount = addGroupCount + 1;
}

function addGroupPermissions(){
	if(addGroupCount <= queueLimit){
		//re adjust the height of modal
		let modalHeight = $('#sangomaModal .modal-dialog').outerHeight();
		let windowHeight = $(window).height();
		let adjustHeight = windowHeight-modalHeight;
		$('#sangomaModal .modal-dialog').addClass('modal-lg');
		if(grouprow == 1){
			$('#grouppermissions').css('display','block');
		}
		let grouphtml = `<tr id="group_permission_${grouprow}" style="display: flex;column-gap: 6px;">
							<td class="delete-entry col-lg-1 col-md-1 col-1"><a class="clickable" onclick="deleteQueueRow('group_permission_${grouprow}',2,'select_group_${grouprow}',${grouprow})"><i class="fa fa-ban fa-fw"></i></a></td>
							<td> <select class="queue-select form-control" id="select_group_${grouprow}" onclick="selectQueues(event, 'select_group_${grouprow}', 'group_permission_${grouprow}',2,${grouprow})"></select></td>
							<td> 
								 <div class=" form-group radioset groupcontrol">
									<input type="radio" id="group_permission_1${grouprow}" name="group_permission_1${grouprow}" value="VIEW" checked  onclick="onChangeGroupPer(event,'group_permission_1${grouprow}',${grouprow})">
									<label for="group_permission_1${grouprow}">View</label>
									<input type="radio" id="group_permission_2${grouprow}" name="group_permission_2${grouprow}" value="MONITOR"  onclick="onChangeGroupPer(event,'group_permission_2${grouprow}',${grouprow})">
									<label for="group_permission_2${grouprow}">MONITOR</label>
								 </div>
							</td>
						</tr>`;
		$('#grouppermissions').append(grouphtml)
		//update queues select option as of now 
		updateGroupSelect(`select_group_${grouprow}`);
		// create dummy paylaod 
		let payloadrow = `group_permission_${grouprow}`;
		let dummypayload={
				'groupcontrol':'VIEW',
				'group':'',
				'id':payloadrow
		}
		groupPayLoad.push(dummypayload);
		adjustContainerHeight();
		grouprow = grouprow+1;
		addGroupCount = addGroupCount + 1;
	}else{
		alert("You reached your limit to add group");
	}

}
function adjustContainerHeight() {

    const container = document.querySelector('.queues');
    if (container) {
		container.style.height = 'auto';
		$('#sangomaModal .stepContainer').css('height','auto');
		$('#sangomaModal .modal-body').css('height','auto');
		updateHeight('step-3');
        // container.style.height = `${container.scrollHeight}px`; // Set the height to the content's height
    }
}

function deleteQueueRow(id,deleteFlag,selectId,rowno,addoredit=null,uid= null){
	rowno= rowno -1;
	let selectqueueval = $(`#${selectId} :selected`).val(); 
	//update queues / calls 
	if(addoredit == 'edit'){
		deleteQueuesCall(selectqueueval,deleteFlag,uid);
	}
	if(deleteFlag == 1){
		$(`#${id}`).remove();
		// queuerow = queuerow-1;
		addQueueCount = addQueueCount -1;
		adjustContainerHeight();
		// delete payLoad[id];
		payLoad = payLoad.filter(function(elm){
			if(elm.id != id){	
				return elm;
			}
		});
		quesueOptions = quesueOptions.filter(function(elm){
			if(elm != selectqueueval){	
				return elm;
			}
		});
	}else if(deleteFlag == 2){
		$(`#${id}`).remove();
		// grouprow = grouprow-1;
		addGroupCount = addGroupCount -1;
		adjustContainerHeight();
		// delete groupPayLoad[id];
		groupPayLoad = groupPayLoad.filter(function(elm){
			if(elm.id != id){	
				return elm;
			}
		});
		groupOptions = groupOptions.filter(function(elm){
			if(elm != selectqueueval){	
				return elm;
			}
		});
	}
}

function updateQueuesSelect(id,editqueue = null){
	var queuesid = $(`#${id}`);
	queuesid.empty();
	if(queueList.length >= 0){
		var queuesid = document.getElementById(id);
		let disabled = '';
		let addclass = '';
		let selected = '';
		queuesid.innerHTML  	= '';
		queuesid.innerHTML 		+=`<option default disabled selected>Select Queues</option>`;
		queuesid.selectedIndex = 0;
		for(let key in queueList){
			if(quesueOptions.includes(queueList[key][0])){
					disabled = 'disabled';
					addclass = "style='background: #c4c6c7'";
			}else{
				disabled = '';
				addclass = "style='background:none'";
			}
			if(editqueue != null){
				if(queueList[key][0] == editqueue){
					selected = 'selected';
					disabled = 'disabled';
					addclass = "style='background: #c4c6c7'";
				}else{
					selected = '';
					disabled = '';
					addclass = "style='background:none'";
				}
			}
			const option = `<option id=${queueList[key][0]} value=${queueList[key][0]} ${disabled} ${addclass} ${selected}>${queueList[key][0]}</option>`;
			queuesid.innerHTML +=option;
		}
		
	}else{
		var queuesid  = document.getElementById(id);
		queuesid.innerHTML = '';
		queuesid.innerHTML +=`<option default selected>Select Queues</option>`;
		queuesid.selectedIndex = 0;
	}
}

function updateGroupSelect(id,editqueue){
	if(groupList.length >= 0){
		var queuesid  			= document.getElementById(id);
		queuesid.innerHTML  	= '';
		queuesid.innerHTML 		+=`<option default disabled selected>Select Group</option>`;
		queuesid.selectedIndex = 0;
		let selected = '';
		for(let key of groupList){
			if(groupOptions.includes(key['id'])){
				disabled = 'disabled';
				addclass = "style='background: #c4c6c7'";
				}else{
					disabled = '';
					addclass = "style='background:none'";
				}
				if(editqueue != null){
					if(key['id'] == editqueue){
						selected = 'selected';
						disabled = 'disabled';
						addclass = "style='background: #c4c6c7'";
					}else{
						selected = '';
						disabled = '';
						addclass = "style='background:none'";
					}
				}
			const option = `<option id=${key['id']} value=${key['id']}  ${disabled} ${addclass} ${selected} >${key['groupname']}</option>`;
			queuesid.innerHTML +=option;
		}
	}else{
		var queuesid  = document.getElementById(id);
		queuesid.innerHTML = '';
		queuesid.innerHTML +=`<option default selected>Select Group</option>`;
		queuesid.selectedIndex = 0;
	}
}

function checkSangomaClientHostAddress(clientHost){
	$.get(`/admin/ajax.php?module=sangomaconnect&command=checkSangomaClientHostAddress&host=${clientHost}`)
		.done(function(response){
			$('.fa-spin').css('display','none');
			$('.stepContainer').css('opacity','1');
			if (wizardType =='enable_scd') systemChecks();
			if (wizardType =='enable_supervisor') systemcheckfor_enablesupervisor();
			return 'Successfully updated';
		}).fail(function(error){
			let errorMessage = error.responseJSON;
			fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
		})
}
function deleteQueuesCall(selectqueueval,deleteFlag,uid){
		$.post("/admin/ajax.php?module=sangomaconnect&command=deleteQueuesCall",{deleteval:selectqueueval,deleteFlag:deleteFlag,uid:uid})
			.done(function(response){
				deleteReloadFlag = 1;
			}).fail(function(error){
							let errorMessage = error.responseJSON;
							fpbxToast(_(errorMessage.error['message'] ),_("Error"),'error');
			})
}
