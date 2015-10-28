// CONFIG ************************************
// add additional study areas GP services here
var config = {
  kimo_gp : 'http://152.46.16.228/arcgis/rest/services/GetTreatmentScore/GPServer/KIMO_MaskTreatment',
  boundary : 'http://152.46.16.228/arcgis/rest/services/kimo_analysis/MapServer/34',
  geometryService : 'http://152.46.16.228/arcgis/rest/services/Utilities/Geometry/GeometryServer'
};
// *******************************************

require(["esri/map",
         "esri/toolbars/draw",
         "esri/graphic",
         "esri/symbols/SimpleFillSymbol",
         "esri/layers/FeatureLayer",
         "esri/dijit/BasemapToggle",
         "gpt/treatment",
         "gpt/geometry",
         "gpt/shapefileUploader",
         "dojo/dom",
         "dojo/on",
         "dojo/dom-class",
         "dojo/domReady!"],
function (Map, Draw, Graphic, SFS, FeatureLayer, BasemapToggle, Treatment, Geometry, ShapeUploader, dom, on, domClass) {
  var map, toolbar, boundary, toggle;
  var results = []; // store multiple treatments

  map = new Map("map", {
    center : [-81.384, 35.136],
    zoom : 13,
    basemap : "topo"
  });
  map.on('load', activateToolbar);

  // boundary layer
  boundary = new FeatureLayer(config.boundary);
  map.addLayer(boundary);

  // basemap switcher
  toggle = new BasemapToggle({ map: map, basemap: "satellite" }, "BasemapToggle");
  toggle.startup();

  function activateToolbar() {
    // activate draw
    toolbar = new Draw(map);
    toolbar.on('draw-end', addToMap);
    on(dom.byId('draw'), 'click', function (e) {
      e.preventDefault();
      domFuncs.thinking();
      map.graphics.clear();
      domClass.add(e.target, 'disabled');
      toolbar.activate(Draw['POLYGON']);
    });
    // activate file upload
    var shapeUploader = new ShapeUploader();
    $("#shp-upload").on("change", function (evt) {
      domFuncs.getResults();
      map.graphics.clear();
      domClass.add(evt.target, 'disabled');
      shapeUploader.readShp(evt, function (result) {
        addToMap(result.features[0]);
      });
    });
  }

  // various dom functions
  var domFuncs = {
    thinking : function () {
      $("#poly-stats").fadeOut();
      $("#stats").html('').hide();
      $("#total-area-raster").html('calculating');
      $("#intro").fadeIn();
    },
    getResults : function () {
      $("#intro").hide();
      $("#stats").hide();
      $("#poly-stats").hide();
      $("#jumbotron").fadeIn();
    }
  };

  function addToMap(evt) {
    // get poly stats
    var geometry = new Geometry(config.geometryService, evt.geometry, function (r) {
      $("#total-area").html(+r.area.toFixed(2));
      $("#perimeter").html(+r.length.toFixed(2));
      $("#poly-stats").show('slow');
    });

    domFuncs.getResults();

    var symbol, graphic, treatment;
    toolbar.deactivate();
    symbol = new SFS();
    graphic = new Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
    treatment = new Treatment(config.kimo_gp);
    treatment.runAnalysis(JSON.stringify(evt.geometry), function (r) {
      $("#jumbotron").slideUp();
      $("#stats").show();
      domClass.remove(dom.byId('draw'), 'disabled');
      results.push(treatment);
      // console.log(treatment.getScore());
      // console.log(treatment.getResult());
      renderResults(treatment.getScore(), r);
    });
  }

  function renderResults(score, res) {
    var source = dom.byId('results-template').innerHTML;
    var template = Handlebars.compile(source);
    dom.byId('stats').innerHTML = template({score : score, res : res});

    // render updated study poly stats
    var totalArea = 0;
    for(var key in res) {
      if(res.hasOwnProperty(key)) {
        for (var score in res[key].layers[0].breakdown.stats) {
          totalArea += res[key].layers[0].breakdown.stats[score].total;
        }
      }
      break;
    }
    totalArea = totalArea * Math.pow(25,2) * 0.000247105;
    $("#total-area-raster").html(totalArea.toFixed(2) + " acres");
  }
});
