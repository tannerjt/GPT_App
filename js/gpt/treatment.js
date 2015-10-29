// treatment class
// abstract out methods to generate score
// and other stuff

define(["dojo/_base/declare", "esri/tasks/Geoprocessor"],
function (declare, GP) {
  return declare(null, {
    constructor : function (url) {
      this.gp = new GP(url);
      this.final_score = 0;
      // TODO - Add this template as separate JSON file
      this.attributes = {
            'WUI' : {
              'label' : 'Wildland Urban Interface Presence',
              'score' : undefined,
              'layers' : [
                { name : 'powerlines', label : 'Powerlines' },
                { name : 'pipelines', label : 'Pipelines' },
                { name : 'facilities', label : 'Facilities' },
                { name : 'private_community', label : 'Private Communities' },
                { name : 'private_structure', label : 'Private Structures' }
              ]
            },
            'DEV' : {
              'label' : 'Distance to Developed Areas',
              'score' : undefined,
              'layers' : [
                { name : 'distance_to_developed_areas', label : 'Distance to Developed Areas'}
              ]
            },
            'FUEL' : {
              'label' : 'Fuel Continuity',
              'score' : undefined,
              'layers' : [
                { name : 'fire_continuity', label : 'Fuel Continuity' }
              ]
            },
            'RESIS' : {
              'label' : 'Resistance to Control',
              'score' : undefined,
              'layers' : [
                { name : 'resistance_to_control', label : 'Resistance to Control' }
              ]
            },
            'TE_RES' : {
              'label' : 'Fire Dependent T&E Species',
              'score' : undefined,
              'layers' : [
                { name : 'fire_dependent_t_e_species', label : 'Fire Dependent T&E Species'}
              ]
            },
            'RARE' : {
              'label' : 'Unique/Rare/Remnant Community',
              'score' : undefined,
              'layers' : [
                { name : 'unique_and_rare_t_e', label : 'Unique/Rare/Remnant Community' }
              ]
            },
            'CULTURE' : {
              'label' : 'Cultural Values Presence',
              'score' : undefined,
              'layers' : [
                { name : 'cultural_values', label : 'Cultural Values Presence' }
              ]
            }
          };
    },
    _organize : function (result) {
      for(var key in this.attributes) {
        if(this.attributes.hasOwnProperty(key)) {
          assignResult.call(this, key);
          this.final_score += this.attributes[key].score;
        }
      }

      function assignResult(key) {
        var layers = this.attributes[key].layers;
        this.attributes[key].score = 0; // init 0
        for(var i = 0; i < layers.length; i++) {
          layers[i].breakdown = result[layers[i].name];
          // score is the greatest of all layers in 
          // a particular variable
          // stats = are for treatment area
          // summary = is for entire study area
          var scores = getScores(layers[i].breakdown.stats);
          scores.sort(sortNumber).reverse();
          if(scores[0] > this.attributes[key].score) {
            this.attributes[key].score = +scores[0];
          }
        }
      }

      function getScores(stats) {
        var scores = [];
        for(var num in stats) {
          if(stats.hasOwnProperty(num)) {
            scores.push(+num);
          }
        }
        return scores;
      }

      function sortNumber(a, b) {
        return a - b;
      }
    },
    runAnalysis : function (input_json, cb) {
      var that = this;
      this.gp.execute({json_input : input_json}, function (res, mes) {
        that.results = res[0].value;
        that._organize(that.results);
        cb.call(that, that.attributes);
      });
    },
    getScore : function () {
      return this.final_score;
    },
    getResult : function () {
      return this.attributes;
    },
    getSimplifiedResult : function () {
      // for high charts
      // { name : '', y : val}
      var simplified = [];
      for(var key in this.attributes) {
        if(this.attributes.hasOwnProperty(key)) {
          var item = {};
          item.name = this.attributes[key].label;
          item.y = this.attributes[key].score;
          simplified.push(item);
        }
      }
      return simplified;
    }
  })
})
