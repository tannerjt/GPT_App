// CONFIG ************************************
// add additional study areas GP services here
var config = {
  kimo_gp : 'http://152.46.16.228/arcgis/rest/services/GetTreatmentScore/GPServer/KIMO_MaskTreatment'
};
// *******************************************

require(["esri/map",
         "esri/toolbars/draw",
         "esri/graphic",
         "esri/symbols/SimpleFillSymbol",
         "gpt/treatment",
         "dojo/dom",
         "dojo/on",
         "dojo/domReady!"],
function (Map, Draw, Graphic, SFS, Treatment, dom, on) {
  var map, toolbar;
  var treatments = []; // store multiple treatments

  map = new Map("map", {
    center : [-81.37, 35.13],
    zoom : 12,
    basemap : "topo"
  });
  map.on('load', activateToolbar);

  function activateToolbar() {
    toolbar = new Draw(map);
    toolbar.on('draw-end', addToMap);
    on(dom.byId('draw'), 'click', function (e) {
      e.preventDefault();
      toolbar.activate(Draw['POLYGON']);
    });
  }

  function addToMap(evt) {
    var symbol, graphic, treatment;
    toolbar.deactivate();
    symbol = new SFS();
    graphic = new Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
    treatment = new Treatment(config.kimo_gp);
    treatment.runAnalysis(JSON.stringify(evt.geometry), function (r) {
      
    });
  }
});
