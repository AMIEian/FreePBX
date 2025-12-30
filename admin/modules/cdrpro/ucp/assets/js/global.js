var CdrproC = UCPMC.extend({
	/**
	 * This function is similar to PHP's __construct
	 * class variables are declared in this method using 'this.variable'
	 */
	init: function(){
		this.time = moment.utc().unix();
		this.playing = null;
	},
	/**
	 * Add Simple Widget
	 * This method is executed when the side bar widget has been added to the side bar.
	 * @method addSimpleWidget
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-addSimpleWidget
	 * @param  {string}      widget_id    The widget UUID on the dashboard
	 */
	addSimpleWidget: function(widget_id) {
		//jQuery Object
		$(".grid-stack-item[data-id='"+widget_id+"']");
	},
	/**
	 * Display Widget
	 * This method is executed when the side bar widget has finished loading.
	 * @method displayWidget
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-displayWidget
	 * @param  {string}      widget_id    The widget ID on the dashboard
	 * @param  {string}      dashboard_id The dashboard ID the widget has been placed on
	 */
	displayWidget: function(widget_id,dashboard_id) {
		//jQuery Object
		$(".grid-stack-item[data-id='"+widget_id+"']");
	},
	/**
	 * Display Side Bar Widget
	 * This method is executed after the side bar widget has been clicked and the window has fully extended has finished loading.
	 * @method displaySimpleWidget
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-displaySimpleWidget
	 * @param  {string}            widget_id The widget id in the sidebar
	 */
	displaySimpleWidget: function(widget_id) {
		//jQuery Object
		$(".widget-extra-menu[data-id="+widget_id+"]");
	},
	/**
	 * Display Widget Settings
	 * This method is executed when the settings window has finished loading.
	 * @method displayWidgetSettings
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-displayWidgetSettings
	 * @param  {string}      widget_id    The widget ID on the dashboard
	 * @param  {string}      dashboard_id The dashboard ID
	 */
	displayWidgetSettings: function(widget_id, dashboard_id) {
		//jQuery Bootstrap Modal Object
		$("#widget_settings .widget-settings-content");
	},
	/**
	 * Display Simple Widget Settings
	 * This method is executed when the settings window has finished loading.
	 * @method displaySimpleWidgetSettings
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-displaySimpleWidgetSettings
	 * @param  {string}      widget_id    The widget ID on the sidebar
	 */
	displaySimpleWidgetSettings: function(widget_id) {
		//jQuery Bootstrap Modal Object
		$("#widget_settings .widget-settings-content")
	},
	/**
	 * Resize Widget
	 * The method is executed when the widget has been resized
	 * @method resize
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-resize
	 * @param  {string}      widget_id    The widget ID on the dashboard
	 * @param  {string}      dashboard_id The dashboard ID
	 */
	resize: function(widget_id,dashboard_id) {
		//jQuery Object
		$(".grid-stack-item[data-id='"+widget_id+"']");
	},
	/**
	 * When the dashboard is displayed and has finished loading
	 * This method is executed when the dashboard has finished loading
	 * @method showDashboard
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-showDashboard
	 * @param  {string}            dashboard_id The dashboard id
	 */
	showDashboard: function(dashboard_id) {
		console.log('%c'+sprintf(_("Dashbord '%s' is currently visible"),dashboard_id),'background: #222; color: #bada55');
	},
	/**
	 * Window State
	 * The method is executed when the tab in the browser (Or the browser itself) is brought into focus or out of focus
	 * @method windowState
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-windowState
	 * @param  {string}      state    The window state. Can be "hidden" or "visible"
	 */
	windowState: function(state) {
		console.log('%c'+sprintf(_("The window state is '%s'"),state),'background: #222; color: #bada55');
	},
	/**
	 * Pre Poll (Before the poll)
	 * This method is used to populate data to send to the PHP poll function for this module
	 * @method prepoll
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-prepoll
	 * @return  {mixed}      Data to send back to the PHP poll function for this module
	 */
	prepoll: function() {
	},
	/**
	 * Poll
	 * This method is used to process data returned from the PHP poll function for this module
	 * @method prepoll
	 * @link https://wiki.freepbx.org/pages/viewpage.action?pageId=71271742#DevelopingforUCP14+-poll(Javascript)
	 * @param  {mixed}      data    Data returned from the PHP poll function for this module
	 */
	poll: function(data){
	}
});
