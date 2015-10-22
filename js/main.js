// CONFIG ************************************
// add additional study areas GP services here
var config = {
  kimo_gp : 'http://152.46.16.228/arcgis/rest/services/GetTreatmentScore/GPServer/KIMO_MaskTreatment',
  boundary : 'http://152.46.16.228/arcgis/rest/services/kimo_analysis/MapServer/34'
};
// *******************************************

require(["esri/map",
         "esri/toolbars/draw",
         "esri/graphic",
         "esri/symbols/SimpleFillSymbol",
         "esri/layers/FeatureLayer",
         "esri/dijit/BasemapToggle",
         "gpt/treatment",
         "dojo/dom",
         "dojo/on",
         "dojo/dom-class",
         "dojo/domReady!"],
function (Map, Draw, Graphic, SFS, FeatureLayer, BasemapToggle, Treatment, dom, on, domClass) {
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
  toggle = new BasemapToggle({
        map: map,
        basemap: "satellite"
      }, "BasemapToggle");
      toggle.startup();

  function activateToolbar() {
    toolbar = new Draw(map);
    toolbar.on('draw-end', addToMap);
    on(dom.byId('draw'), 'click', function (e) {
      e.preventDefault();
      map.graphics.clear();
      domClass.add(e.target, 'disabled');
      toolbar.activate(Draw['POLYGON']);
    });
  }

  function addToMap(evt) {
    // convert to pure dojo
    $("#intro").hide();
    $("#stats").hide();
    $("#jumbotron").fadeIn();
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
  }
});
