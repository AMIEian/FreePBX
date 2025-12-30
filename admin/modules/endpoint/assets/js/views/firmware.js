$(function() {
    if ((typeof(needcustomfw) !== 'undefined') && needcustomfw) {
	if (confirm(_("You are using custom firmware management option.\n"+
				" Sangoma has implemented new way of doing custom firmware management via GUI.\n"+
				" Do you want to use new GUI supported way of doing Custom management?" +
				" Please note that using new method means manually uploaded custom firmwares will be erased and new method requires you to upload new custom phone firmware ?' \n" +
			        " Please use 'Cancel' option , If you are not sure or want to stay in your current manual approach."))) {

		if (typeof(bname) !== 'undefined') {
		$.ajax({
			url: "/admin/ajax.php",
			data: {
				module: 'endpoint',
				command: 'customfw',
				brand: bname 
			},
			type: "POST",
	 		success: function(data) {
				window.location = `?display=endpoint&view=firmware&brand=`+bname;
			}
		});
	     }
	  }
    }

    $("form#firmware").submit(function() {
        const brand = $("input[name=brand]").val();
        if (brand == 'digium') {
            const fwToCheckwith = '4_22_0';
            var fwExistsInSlot1, fwExistsInSlot2, fwOfSlot1, fwOfSlot2 = false;
            const slot1Data = ($("input[name=slot1]").val() == '0.00') ? false : $('#slot1TA').html();
            if (slot1Data) {
                const getFW = slot1Data.split('<br>');
                getFW.forEach(fw => {
                    const fwToCheckSlot1 = fw.trim().split(/\s+/);
                    if ((typeof(fwToCheckSlot1[1]) !== 'undefined') && fwToCheckSlot1[0] === 'P320') {
                        fwOfSlot1 = fwToCheckSlot1[1];
                        fwExistsInSlot1 = checkFWVersion(fwToCheckSlot1[1], fwToCheckwith);
                    }
                });
            }
            const slot2Data = ($("input[name=slot2]").val() == '0.00') ? false : $('#slot2TA').html();
            if (slot2Data) {
                const getFW = slot2Data.split('<br>');
                getFW.forEach(fw => {
                    const fwToCheckSlot2 = fw.trim().split(/\s+/);
                    if (typeof(fwToCheckSlot2) !== 'undefined' && fwToCheckSlot2[0] === 'P320') {
                        fwOfSlot2 = fwToCheckSlot2[1];
                        fwExistsInSlot2 = checkFWVersion(fwToCheckSlot2[1], fwToCheckwith);
                    }
                });
            }
            if ((fwExistsInSlot1 || fwExistsInSlot2)) {
                const slotsText = [fwExistsInSlot1 ? `Slot 1 is ${fwOfSlot1}` : '', fwExistsInSlot2 ? `Slot 2 is ${fwOfSlot2}` : ''].filter(Boolean).join(' and ');
                const fwUrl = 'https://sangomakb.atlassian.net/wiki/spaces/Phones/pages/14516566/Version+4_X+Firmware';
                const message = _(`P series phones with firmware version ${fwToCheckwith}+ cannot be downgraded to a version below ${fwToCheckwith}. For more details, please visit: <${fwUrl}>. You currently have firmware version ${slotsText} selected. Would you like to proceed? `);
                if (!confirm(message)) {
                    return false;
                }
            }
        }
    });

    $( "#slot1" ).sortable({
        connectWith: '.firm',
        create: function(event, ui) {
            if($(this).children().length >= 1) {
                $(this).children().addClass('filled');
                $(this).addClass('dontDrop');
            }else {
                $(this).children().removeClass('filled');
            }
        },

        receive: function(event,ui) {
            if($(this).children().length >= 2) {
                $(ui.sender).sortable("cancel");
                $(this).children().addClass('filled');
                $(this).addClass('dontDrop');
            }else {
                $(this).children().removeClass('filled');
                $(this).removeClass('dontDrop');
            }
            update: endpoint_save_firmware_slot1()
        },
        remove: function(ui){
            if($(this).children().length >=0){
                $(this).children().removeClass('filled');
                $(this).removeClass('dontDrop');
            }
	    $('#slot1TA').html('');
            update: endpoint_save_firmware_slot1()
        }

    }).disableSelection();
    $( "#slot2" ).sortable({
        connectWith: '.firm',
        create: function(event, ui) {
            if($(this).children().length > 1) {
                $(this).children().addClass('filled');
                $(this).addClass('dontDrop');
            }else {
                $(this).children().removeClass('filled');
            }
        },
        receive: function(event,ui) {
            if($(this).children().length >= 2) {
                $(ui.sender).sortable("cancel");
                $(this).children().addClass('filled');
                $(this).addClass('dontDrop');
            }else {
                $(this).children().removeClass('filled');
            }
            update: endpoint_save_firmware_slot2()
        },
        remove: function(ui){
            if($(this).children().length >=0){
                $(this).children().removeClass('filled');
                $(this).removeClass('dontDrop');
            }
	    $('#slot2TA').html('');
            update: endpoint_save_firmware_slot2()
        }
    }).disableSelection();

    $('#available').sortable({
        connectWith: '.firm',
        remove: function(ui){
            if($(this).children().length >=0){
                $(this).children().removeClass('filled');
            }
        }
    }).disableSelection();
});


function endpoint_save_firmware_slot1() {
        $('form#firmware input[name^=available]').remove();
        // remove empty
	$('form#firmware input[name^=slot1]').remove();
        $('form#firmware ul#slot1 li').each(function(){
                field           = document.createElement('input');
                field.name      = 'slot1';
                field.type      = 'hidden';
		result = $(this).text();
		field.value = result;
	       	$('form#firmware').append(field);
                $('#slot1TA').html(firmDesc[result]);
        })

}
function endpoint_save_firmware_slot2() {
	$('form#firmware input[name^=available]').remove();
        // remove empty
	$('form#firmware input[name^=slot2]').remove();
        $('form#firmware ul#slot2 li').each(function(){
                field           = document.createElement('input');
                field.name      = 'slot2';
                field.type      = 'hidden';
		result = $(this).text();
		field.value = result;
                $('form#firmware').append(field);
                $('#slot2TA').html(firmDesc[result]);
        })
}

function checkFWVersion(fwToCheck, fwToCheckwith) {
    const fw1 = fwToCheck.split('_').map(Number);
    const fw2 = fwToCheckwith.split('_').map(Number);
    for (let i = 0; i < fw1.length; i++) {
        if (fw1[i] > fw2[i]) return true;
        if (fw1[i] < fw2[i]) return false;
    }
    return true;
}
