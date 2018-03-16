sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";
	var oMockServer,
		_sAppModulePath = "zoverviewpage/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";
	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "",
				//entities = "[object Object],[object Object],[object Object]",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oDataSources = oManifest["sap.app"].dataSources;
			for (var property in oDataSources) {
				if (oDataSources.hasOwnProperty(property)) {
					var sDataSource = oDataSources[property],
						sUri = sDataSource.settings.localUri;
					//do we have a mock url in the app descriptor
					if (sDataSource.settings && sDataSource.settings.localUri) {
						if (typeof sDataSource.type === "undefined" || sDataSource.type === "OData") {
							var sLocalUri = jQuery.sap.getModulePath(_sAppModulePath + sDataSource.settings.localUri.replace(".xml", ""), ".xml");
							oMockServer = new MockServer({
								rootUri: sUri,
								requests: [{
									method: "GET",
									path: new RegExp(""),
									response: function(oXhr) {
										jQuery.sap.require("jquery.sap.xml");

										var oAnnotations = jQuery.sap.sjax({
											url: sLocalUri,
											dataType: "xml"
										}).data;

										oXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));
										return true;
									}
								}]
							});
							oMockServer.simulate(sLocalUri, {
								sMockdataBaseUrl: sJsonFilesUrl,
								bGenerateMissingMockData: true
							});
							oMockServer.start();
						}
					}
				}
			}

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});

			var aRequests = oMockServer.getRequests(),
				fnResponse = function(iErrCode, sMessage, aRequest) {
					aRequest.response = function(oXhr) {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};

			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");

		},
		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer}
		 */
		getMockServer: function() {
			return oMockServer;
		}
	};
});