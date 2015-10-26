// @name : geometry.js
// @type : dojo-class
// @author : Joshua Tanner
// @description : Handle getting area for treatment poly
// @todo : this should probably return a deferred obj instead of callback
define(['dojo/_base/declare', 
	    'esri/geometry/Geometry',
	    'esri/geometry/Extent',
	    'esri/SpatialReference',
	    'esri/tasks/GeometryService',
	    'esri/tasks/AreasAndLengthsParameters'],
function (declare, Geometry, Extent, SpatialReference, GeometryService, AreasandLengthsParams) {
	return declare(null, {
		constructor : function (service, geom, cb) {
			this.cb = cb;
			this.geom = geom;
			this.geometryService = new GeometryService(service);

			var that = this;
			this.geometryService.on("areas-and-lengths-complete", function (r) {
				that.cb({
					area : r.result.areas[0],
					length : r.result.lengths[0]
				});
			});
			this._getAreaandLength();
		},
		_getAreaandLength : function () {
			// setup params for areas and lengths
			var areasAndLengthsParams = new AreasandLengthsParams();
			areasAndLengthsParams.lengthUnit = GeometryService.UNIT_FOOT;
			areasAndLengthsParams.areaUnit = GeometryService.UNIT_ACRES;
			areasAndLengthsParams.calculationType = "geodesic";
			areasAndLengthsParams.polygons = [this.geom];
			this.geometryService.areasAndLengths(areasAndLengthsParams);
		}
	})
});