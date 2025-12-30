<div class="container-fluid">
	<h1>
		<?php echo _('Dynamic Route') ?>
	</h1>
	<div class="display no-border">
		<div class="row">
			<div class="col-sm-12">
				<div class="fpbx-container">
					<div id="toolbar-all">
						<a href="config.php?display=dynroute&amp;action=add" class="btn btn-default">
							<i class="fa fa-plus"></i>&nbsp;
							<?php echo _("Add Dynamic Route") ?>
						</a>
					</div>
					<table id="dynroutegrid"
						data-url="ajax.php?module=dynroute&amp;command=getJSON&amp;jdata=grid"
						data-cache="false"
						data-toggle="table"
						data-cookie="true"
						data-cookie-id-table="dynroutegrid"
						data-toolbar="#toolbar-all"
						data-maintain-selected="true"
						data-pagination="true"
						data-search="true"
						class="table table-striped">
						<thead>
							<tr>
								<th data-sortable="true" data-field="name">
									<?php echo _("Dynamic Route Name") ?>
								</th>
								<th data-sortable="true" data-field="description">
									<?php echo _("Dynamic Route Description")?>
								</th>
								<th class="col-md-2" data-field="link" data-formatter="actionFormatter">
									<?php echo _("Actions") ?>
								</th>
							</tr>
						</thead>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
