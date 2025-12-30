$(document).ready(function() {
        $(document).on('change', '.type', function() {
                var name = $(this).prop('name');
                var length = name.length;
                name = name.substr(0, length - 4);

                if($("#" + name + 'acct').val() == ''){
                        $("#" + name + 'acct').val('account1')
                } else {
                        if($(this).find("option:selected").text() == 'Blank'){
                                $("#" + name + 'acct').val('');
                                $("#" + name + 'label').val('');
                                $("#" + name + 'value').val('');
                        }
                }

                switch($(this).find("option:selected").text()){
                        //line keys first
                        case 'Line':
                                $("." + name + 'value').hide();
                                $("#" + name + 'xml').hide();
                                $("." + name + 'label').hide();
                                $("#" + name + 'keyevent').hide();
                                $("." + name + 'valueFill').show();
                                $("." + name + 'labelFill').show();
                        break;
                        case 'Key Event':
                                $("#" + name + 'value').hide();
                                $("." + name + 'valueFill').hide();
                                $("." + name + 'labelFill').hide();
                                $("." + name + 'label').show();
                                $("#" + name + 'keyevent').show();
                        break;
                        case 'Accept Call':
                        case 'Cancel Call':
                        case 'End Call':
                        case 'Missed Call':
                        case 'CallLog':
                        case 'Contact':
                        case 'Dial':
                        case 'Save':
                        case 'DND':
                        case 'Menu':
                        case 'Delete':
                        case 'Exit':
                        case 'Reboot':
                        case 'None':
                                $("#" + name + 'value').hide();
                                $("." + name + 'valueFill').hide();
                                $("." + name + 'labelFill').hide();
                                $("." + name + 'label').hide();
                                $("#" + name + 'keyevent').hide();
                        break;
                        default:
                                $("#" + name + 'xml').hide();
                                $("#" + name + 'value').show();
                                $("." + name + 'value').show();
                                $("." + name + 'valueFill').hide();
                                $("." + name + 'label').show();
                                $("." + name + 'labelFill').hide();
                                $("#" + name + 'park').hide();
                                $("#" + name + 'keyevent').hide();
                        break;
                }
        });

        $(document).on('change', '.KeyEvent', function() {
                var name = $(this).prop('name');
                var length = name.length;
                name = name.substr(0, length - 8);
                var txt = $(this).find("option:selected").text();
                switch($(this).find("option:selected").text()){
                        case 'None':
                        case 'Voice Mail':
                        case 'DND':
                        case 'Call hold':
                        case 'Call Transfer':
                        case 'Phonebook':
                        case 'Redial':
                        case 'Pickup':
                        case 'Join':
                        case 'Call Forward':
                        case 'Call Logs':
                        case 'Flash':
                        case 'Memo':
                        case 'Headset':
                        case 'Release':
                        case 'Call Back':
                        case 'Handfree':
                        case 'Answer Key':
                        case 'End Call':
                        case 'LongPress Mute Key':
                                $("#" + name + 'label').val(txt);
                        break;
                        default:
                        break;
                }
        });
});