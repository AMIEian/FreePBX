(function ($, window, document, undefined) {

  $inviteButton = $('#sangomaconnect-invite-user'),
  $dynamicModal = $('#dynamic-modal'),
  $advancedNetwork = $('.advanced-network'),
  $advancedNetworkForm = $('#advanced-network-form'),
  $advancedNetworkEnableBtn = $('#sangomaconnect-adv-network1'),
  $sangomaconnectEnableBtn = $('#sangomaconnect1'),
  $sangomaconnectDisableBtn = $('#sangomaconnect2')
  $scdWebRTCEnableBtn = $('#sangomaconnect_enable_webrtc1');
  $scdWebRTCDisableBtn = $('#sangomaconnect_enable_webrtc2');
  $advancedNetworkDisableBtn = $('#sangomaconnect-adv-network2');
  let scdWebRTCInitialCheckedBtn = $scdWebRTCEnableBtn.prop('checked') ? $scdWebRTCEnableBtn : $scdWebRTCDisableBtn;
  $inviteButton.on('click', function () {
    if ($('#sangomaconnect_errors').val() !== '') {
      let $this = $(this),
        $icon = $(".fa-envelope-o", $this),
        id = $this.attr('data-id');
      $icon.addClass("animate");
      $this.attr('disabled', true);
      $.ajax({
        url: "ajax.php",
        type: "POST",
        data: { command: "generateTmpPwd", module: "sangomaconnect", user: id },
        success: (result) => {
          $icon.removeClass("animate");
          $this.attr('disabled', false);
          if (result.status) {
            $(".dynamic", $dynamicModal).hide();
            $(".modal-body.server-success p", $dynamicModal).html("Invitation has been sent to the user");
            $(".server-success", $dynamicModal).show();
            $dynamicModal.modal("show");
          } else {
            $(".dynamic", $dynamicModal).hide();
            $(".modal-body.server-error p", $dynamicModal).html(result.message);
            $(".server-error", $dynamicModal).show();
            $dynamicModal.modal("show");
          }
        },
        error: (error) => {
          $icon.removeClass("animate");
          $(".dynamic", $dynamicModal).hide();
          $(".modal-body.server-error p", $dynamicModal).html("Server Error");
          $(".server-error", $dynamicModal).show();
          $dynamicModal.modal("show");
          console.error(error)
        }

      })
    }
  })
  if($sangomaconnectEnableBtn.prop("checked")) {
    $advancedNetwork.show();
  } else {
    $scdWebRTCEnableBtn.prop('disabled', true);
    $scdWebRTCDisableBtn.prop('disabled', true);
  }
  $advancedNetworkEnableBtn.on('click', function () {
    $advancedNetworkForm.show();
  })

  $advancedNetworkDisableBtn.on('click', function () {
    $advancedNetworkForm.hide();
  })
  $sangomaconnectEnableBtn.on('click', function () {
    $advancedNetwork.show();
    if($("#desktop_error_found").val() != '1') {
      $scdWebRTCEnableBtn.prop('disabled', false);
      $scdWebRTCDisableBtn.prop('disabled', false);
    }
  })
  $sangomaconnectDisableBtn.on('click', function () {
    if ($scdWebRTCEnableBtn.prop('checked') && $("#desktop_error_found").val() != '1') {
      if (confirm(_("Disabling Sangoma Connect Mobile will disable Sangoma Phone desktop clients and Queue/Supervisor permissions as well. Do you want to continue?"))) {
        $advancedNetwork.hide();
        $scdWebRTCEnableBtn.prop('disabled', true);
        $scdWebRTCDisableBtn.prop('disabled', true);
      } else {
        $sangomaconnectEnableBtn.prop("checked", true);
        $scdWebRTCEnableBtn.prop('disabled', false);
        $scdWebRTCDisableBtn.prop('disabled', false);
      }
    } else {
      $advancedNetwork.hide();
      $scdWebRTCEnableBtn.prop('disabled', true);
      $scdWebRTCDisableBtn.prop('disabled', true);
    }
  })
  $scdWebRTCDisableBtn.on('click', function (event) {
    if ($("#desktop_error_found").val() != '1') {
      if (!confirm(_('Disabling Sangoma Phone Desktop Client will disable Queue/Supervisor permissions as well. Do you want to continue?'))) {
        event.preventDefault();
        scdWebRTCInitialCheckedBtn.prop('checked', true);
      } else {
        document.querySelectorAll('[id^="queue_permission_"]').forEach(function(row) {
          row.remove();
        });
        document.querySelectorAll('[id^="call_monitoring_permission_"]').forEach(function(row) {
          row.remove();
        });
      }
    }
  })
})(jQuery, window, document);

const QUEUE = 'queue';
const CALL_MONITORING = 'call_monitoring';
const VALID_TYPES = [QUEUE, CALL_MONITORING];
function getLastIndex(type) {
  if (!VALID_TYPES.includes(type)) {
    return;
  }
  let lastId = $("#" + type + "_permissions tr[id^='" + type + "_permission_']:last-child").attr("id");
  let index = 0;
  if (lastId) {
    index = lastId.replace(type + '_permission_', '');
  }
  return index;
}

function getNextIndex(type) {
  if (!VALID_TYPES.includes(type)) {
    return;
  }
  const index = parseInt(getLastIndex(type)) + 1;
  return index;
}

function addPermission() {
  let ischecked = $('#sangomaconnect_enable_webrtc1:checked').val();
  if(!ischecked){
    fpbxToast(_("Please Enable Sangoma Phone Login to continue.."),_("Warning"),'warning');
		return false;
  }
	if ($(".queue-select").length >= $("#queue_length").val()) {
		fpbxToast(_("No more Queues available!"),_("Warning"),'warning');
		return false;
	}
  let index = getNextIndex(QUEUE);
  let permisionindex = `queue_permission_${index}3`;
  let permisionindex2 = `queue_permission_${index}4`;
	let row = '<tr id="queue_permission_' + index + '">';
	row += '	<td class="delete-entry"><a class="clickable" onclick="deletePermission(' + index + ', 0, 0)"><i class="fa fa-ban fa-fw"></i></a></td>';
	row += '	<td>';
	row += '		<select class="queue-select form-control" id="queue_id_' + index + '" name="queue_id_' + index + '">';
	row += '		</select>';
	row += '	</td>';
	row += '	<td>';
	row += '		<div class="col-md-9 radioset">';
	row += '			<input type="radio" id="queue_permission_' + index + '3" name="queue_permission_' + index + '" value="DETAILED_VIEW" checked>';
	row += '			<label for="queue_permission_' + index + '3">Detailed View</label>';
  if ($('#queue_permission_enabled').val() == 1) {
    row += '      <input type="radio" id="queue_permission_' + index + '4" name="queue_permission_' + index + '" value="QUEUE_CALL_CONTROL">';
    row += '      <label for="queue_permission_' + index + '4">Queue Call Control</label>';
  }
	row += '		</div>';
	row += '	</td>';
	row += '</tr>';

	$("#queue_permissions").append(row);
	$("#queue_id_" + index).append($("#queue_select_sample").html());
	$("#last_queue_index").val(index);
	updateQueueList();
  if($("#desktop_error_found").val() == 1) {
    $('.queue-select').prop('disabled',true)
    $(`#${permisionindex}`).prop('disabled',true);
    $(`#${permisionindex2}`).prop('disabled',true);
  }else{
    $('.queue-select').prop('disabled',false)
    $(`#${permisionindex}`).prop('disabled',false);
    $(`#${permisionindex2}`).prop('disabled',false);
  }
}

function deletePermission(index, queueId, userId) {
	if (queueId != 0) {
		$.post(
			'ajax.php',
			{
				command: 'deleteQueuePermissions',
				module: 'sangomaconnect',
				queueId: queueId,
				userId: userId
			},
			function (data) {
				if (data.status) {
					$("#queue_permission_" + index).remove();
				}
        fpbxToast(data.message, '', data.type);
				updateQueueList();
        $("#last_queue_index").val(getLastIndex(QUEUE));
			}
		)
	} else {
		$("#queue_permission_" + index).remove();
		updateQueueList();
    $("#last_queue_index").val(getLastIndex(QUEUE));
	}
}

function updateQueueList() {
	$("#queue_permissions .queue-select").each( function() {
		let elementId = $(this).attr('id');
		let selectedValue = $('#' + elementId).val();
		$('#' + elementId + ' option').prop('disabled', false);
		$('#' + elementId + ' option').css('background', 'none');
		$('#' + elementId + ' option').css('color', 'unset');
		$("#queue_permissions .queue-select").each( function() {
			let selectId = $(this).attr('id');
			let queueId = $('#' + selectId).val();
			if (selectedValue != queueId && queueId != '') {
				$('#' + elementId + ' option[value="' + queueId + '"]').prop('disabled', true);
				$('#' + elementId + ' option[value="' + queueId + '"]').css('background', '#bbc9c2');
				$('#' + elementId + ' option[value="' + queueId + '"]').css('color', '#949494');
			}
		});
	});
  checkUIELementsStates();
}

$(document).on('change', '.queue-select', function() {
	updateQueueList();
});

function addCallMonitoringPermission() {
  let ischecked = $('#sangomaconnect_enable_webrtc1:checked').val();
  if(!ischecked){
    fpbxToast(_("Please Enable Sangoma Phone Login to continue.."),_("Warning"),'warning');
		return false;
  }
  if ($(".group-select").length >= $("#group_length").val()) {
    fpbxToast(_("No more Call Activity Groups available!"), _("Warning"), 'warning');
    return false;
  }
  let index = getNextIndex(CALL_MONITORING);
  let permisionindex = `call_monitoring_permission_${index}1`;
  let permisionindex2 = `call_monitoring_permission_${index}2`;
  let row = '<tr id="call_monitoring_permission_' + index + '">';
  row += '	<td class="delete-entry"><a class="clickable" onclick="deleteCallMonitoringPermission(' + index + ', 0, 0)"><i class="fa fa-ban fa-fw"></i></a></td>';
  row += '	<td>';
  row += '		<select class="group-select form-control" id="group_id_' + index + '" name="group_id_' + index + '">';
  row += '		</select>';
  row += '	</td>';
  row += '	<td>';
  row += '		<div class="col-md-9 radioset">';
  row += '			<input type="radio" id="call_monitoring_permission_' + index + '1" name="call_monitoring_permission_' + index + '" value="VIEW" checked>';
  row += '			<label for="call_monitoring_permission_' + index + '1">View</label>';
  row += '			<input type="radio" id="call_monitoring_permission_' + index + '2" name="call_monitoring_permission_' + index + '" value="MONITOR">';
  row += '			<label for="call_monitoring_permission_' + index + '2">Monitor</label>';
  row += '		</div>';
  row += '	</td>';
  row += '</tr>';
  $("#call_monitoring_permissions").append(row);
  $("#group_id_" + index).append($("#group_select_sample").html());
  $("#last_group_index").val(index);
  updateCallMonitoringList();
  if($("#desktop_error_found").val() == 1) {
    $('.group-select').prop('disabled',true)
    $(`#${permisionindex}`).prop('disabled',true);
    $(`#${permisionindex2}`).prop('disabled',true);
  }else{
    $('.group-select').prop('disabled',false)
    $(`#${permisionindex}`).prop('disabled',false);
    $(`#${permisionindex2}`).prop('disabled',false);
  }
}
function enableDisableElement(id, enable) {
  if (!enable) {
    $('#' + id).off('click').addClass('disabled').css({
      'pointer-events': 'none',
      'opacity': '0.5',
      'cursor': 'default',
      'color': '#ccc'
    });
  } else {
    $('#' + id).on('click').removeClass('disabled').css({
      'pointer-events': '',
      'opacity': '',
      'cursor': '',
      'color': ''
    });
  }
}
function updateCallMonitoringList() {
  $("#call_monitoring_permissions .group-select").each(function () {
    let elementId = $(this).attr('id');
    let selectedValue = $('#' + elementId).val();
    $('#' + elementId + ' option').prop('disabled', false);
    $('#' + elementId + ' option').css('background', 'none');
    $('#' + elementId + ' option').css('color', 'unset');
    $("#call_monitoring_permissions .group-select").each(function () {
      let selectId = $(this).attr('id');
      let groupId = $('#' + selectId).val();
      if (selectedValue != groupId && groupId != '') {
        $('#' + elementId + ' option[value="' + groupId + '"]').prop('disabled', true);
        $('#' + elementId + ' option[value="' + groupId + '"]').css('background', '#bbc9c2');
        $('#' + elementId + ' option[value="' + groupId + '"]').css('color', '#949494');
      }
    });
    checkUIELementsStates();
  });
}
function checkUIELementsStates() {
  let callCount = $('#call_monitoring_permissions').children('tr').length;
  let queuecount = $('#queue_permissions').children('tr').length;
  $('#info_text_queue_perm').hide();
  $('#info_text_call_mon').hide();
  let grpLimit = parseInt($('#queues_per_user_limit').val()) || 0;
  if (callCount >= grpLimit) {
    enableDisableElement('add_call_mon_perm_btn', false);
    if (callCount == grpLimit) $('#info_text_call_mon').css('color', 'black'); else $('#info_text_call_mon').css('color', 'red');
    $('#info_text_call_mon').html('<strong>You are currently using '+ callCount +' of '+ grpLimit + '(sc_queue) Call Permissions</strong>');
    $('#info_text_call_mon').show();
    $('#add_call_mon_perm_btn').hide();
  } else {
    enableDisableElement('add_call_mon_perm_btn', true);
    $('#add_call_mon_perm_btn').show();
  }

  let queusLimit = parseInt($('#queues_per_user_limit').val()) || 0;
  if (queuecount >= queusLimit) {
    enableDisableElement('add_queue_perm_btn', false);
    if(queuecount == queusLimit) $('#info_text_queue_perm').css('color', 'black'); else $('#info_text_queue_perm').css('color', 'red');
    $('#info_text_queue_perm').html('<strong>You are currently using '+ queuecount +' of '+ queusLimit + ' Queues(sc_queue) Permissions</strong>');
    $('#info_text_queue_perm').show();
    $('#add_queue_perm_btn').hide();
  } else {
    enableDisableElement('add_queue_perm_btn', true);
    $('#add_queue_perm_btn').show();
  }
}
function deleteCallMonitoringPermission(index, groupId, userId) {
  if (groupId != 0) {
    $.post(
      'ajax.php',
      {
        command: 'deleteCallMonitoringPermissions',
        module: 'sangomaconnect',
        groupId: groupId,
        userId: userId
      },
      function (data) {
        if (data.status) {
          $("#call_monitoring_permission_" + index).remove();

        }
        fpbxToast(data.message, '', data.type);
        updateCallMonitoringList();
        $("#last_group_index").val(getLastIndex(CALL_MONITORING));
      }
    )
  } else {
    $("#call_monitoring_permission_" + index).remove();
    updateCallMonitoringList();
    $("#last_group_index").val(getLastIndex(CALL_MONITORING));
  }
}
$(document).on('change', '.group-select', function () {
  updateCallMonitoringList();
});
$(document).ready(function () {
  checkUIELementsStates();
  let user_limit = parseInt($('#queue_app_users_limit').val()) || 0;
  let active_user_count = parseInt($('#active_user_count').val()) || 0;
  let queues_per_user_limit = parseInt($('#queues_per_user_limit').val()) || 0;
  let queue_app_users_limit = parseInt($('#queue_app_users_limit').val()) || 0;
  let queue_app_active_user_count =  parseInt($('#queue_app_active_users_count').val()) || 0;
    if(active_user_count >= queue_app_users_limit){
        if($('#queue_permissions').children('tr').length > 0 || $('#call_monitoring_permissions').children('tr').length >0 ){
          if($('#queue_permissions').children('tr').length == queues_per_user_limit ){
            enableDisableElement('add_queue_perm_btn', false);
          }
          if($('#call_monitoring_permissions').children('tr').length == queues_per_user_limit){
            enableDisableElement('add_call_mon_perm_btn', false);
          }
        }else if($('#queue_permissions').children('tr').length == 0 || $('#call_monitoring_permissions').children('tr').length == 0){
          enableDisableElement('add_queue_perm_btn', false);
          enableDisableElement('add_call_mon_perm_btn', false);
        }
    }
});
