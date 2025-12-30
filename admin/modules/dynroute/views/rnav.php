<div id="toolbar-dynroutebnav">
<a href="config.php?display=dynroute" class = "btn btn-default"><i class="fa fa-list"></i>&nbsp;<?php echo _("List Dynamic Routes")?></a>
<a href="config.php?display=dynroute&action=add" class = "btn btn-default"><i class="fa fa-plus"></i>&nbsp;<?php echo _("Add Dynamic Route")?></a>
</div>
<table id="dynroutenavgrid"
 		data-search="true"
		data-toolbar="#toolbar-dynroutebnav"
		data-url="ajax.php?module=dynroute&command=getJSON&jdata=grid"
		data-cache="false"
		data-toggle="table" 
		class="table">
	<thead>
			<tr>
			<th data-field="name" data-sortable="true"><?php echo _("Dynamic Route List")?></th>
		</tr>
	</thead>
</table>
<script type="text/javascript">
	$("#dynroutenavgrid").on('click-row.bs.table',function(e,row,elem){
		window.location = '?display=dynroute&action=edit&id='+row['id'];
	})
</script>
