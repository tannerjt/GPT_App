// @name: shapefileUploader.js
// @author: Joshua Tanner
// @description: use HTML5 FileReader API to 
//               upload shapefile and convert GeoJSON to Esri Graphic
// @dependencies: shapefile-js (https://github.com/calvinmetcalf/shapefile-js)
//                esriConverter
//                jquery (for now.. convert to pure dojo later)
// @type: dojoClass

// todos
// 1. check browswer (file reader only works ie += 10)
// 2. check multiple features ( we only want one )
// 3. check coordinate system and projection

define(["dojo/_base/declare", "esri/geometry/jsonUtils", "esri/geometry/webMercatorUtils"], function (declare, jsonUtils, webMercatorUtils) {
	return declare(null, {
		constructor : function () {
			// instantiation method
		},
		_compatability : function () {
			if (window.File && window.FileReader&& window.FileList && window.Blob) {
				// it works
				return true;
			} else {
				alert("File API's not supported.  Please use Chrome or Firefox.");
				return false;
			}
		},
		_convertEsri : function (geojson) {
			var converter = new geoJsonConverter();
			var esriJson = converter.toEsri(geojson);
			// convert to web mercator
			esriJson.features[0].geometry = jsonUtils.fromJson(esriJson.features[0].geometry);
			return esriJson;
		},
		readShp : function (evt, cb) {
			if(this._compatability) {
				var file = evt.target.files[0];
				var reader = new FileReader();
				var that = this;
				reader.onload = (function (theFile) {
					return function (e) {
					  var geojson = shp.parseZip(e.target.result);
					  var esriJson = that._convertEsri(geojson);
					  cb(esriJson);
					}
				})(file);
				reader.readAsArrayBuffer(file);
			}
		}
	});
});