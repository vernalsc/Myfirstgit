(function() {
	"use strict";
	/*global sap, jQuery */

	/**
	 * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
	 *   OData service.
	 * Git version
	 * @version @version@
	 */
	jQuery.sap.declare("zoverviewpage.Component");

	jQuery.sap.require("sap.ovp.app.Component");

	sap.ovp.app.Component.extend("zoverviewpage.Component", {
		metadata: {
			manifest: "json"
		}
	});
}());