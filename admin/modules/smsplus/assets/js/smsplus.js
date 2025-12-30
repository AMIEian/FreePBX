function format(value,row) {
        html = '<button type="button" class="btn btn-info btn-lg" data-timestamp="' + row['Eventtime'] + '" data-toggle="modal" data-target="#smspreview">show</button>';
	return html;
}

$('#smspreview').on('show.bs.modal', function (e) {
        var timestamp = $(e.relatedTarget).data('timestamp');
        var post_data = {
		module		: 'smsplus',
		command		: 'getMessage',
		timestamp	: timestamp
	};
        $.post(window.FreePBX.ajaxurl, post_data, function(data)
	{
                if(data.status) {
                        document.getElementById('showMessage').innerHTML = data.body;
                }
	});
});

function queryParams(params){
        var formData = $("#sms").serialize();
        $.each(formData.split('&'), function(k,v) {
                var parts = v.split('=');
                params[parts[0]] = parts[1]
        })
        return params;
}

$("#getsmsreport").click(function(e) {
        $('#smsreport').bootstrapTable('refresh');
});

function dateformatter(val, row){
	unixtimestamp = parseInt(row.Eventtime);
	return moment.unix(unixtimestamp).tz(timezone).format(datetimeformat);
}