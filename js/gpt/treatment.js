// treatment class
// abstract out methods to generate score
// and other stuff

define(["dojo/_base/declare", "esri/tasks/Geoprocessor"],
function (declare, GP) {
  // private objects
  var final_score = 0;
  var attributes = {
    'WUI' : {
      'label' : 'Wildland Urban Interface Presence',
      'score' : undefined,
      'layers' : [
        { name : 'powerlines' },
        { name : 'pipelines' },
        { name : 'facilities' },
        { name : 'private_community' },
        { name : 'private_structure' }
      ]
    },
    'DEV' : {
      'label' : 'Distance to Developed Areas',
      'score' : undefined,
      'layers' : [
        { name : 'distance_to_developed_areas'}
      ]
    },
    'FUEL' : {
      'label' : 'Fuel Continuity',
      'score' : undefined,
      'layers' : [
        { name : 'fire_continuity' }
      ]
    },
    'RESIS' : {
      'label' : 'Resistance to Control',
      'score' : undefined,
      'layers' : [
        { name : 'resistance_to_control' }
      ]
    },
    'TE_RES' : {
      'label' : 'Fire Dependent T&amp;E Species',
      'score' : undefined,
      'layers' : [
        { name : 'fire_dependent_t_e_species'}
      ]
    },
    'RARE' : {
      'label' : 'Unique/Rare/Remnant Community',
      'score' : undefined,
      'layers' : [
        { name : 'unique_and_rare_t_e' }
      ]
    },
    'CULTURE' : {
      'label' : 'Cultural Values Presence',
      'score' : undefined,
      'layers' : [
        { name : 'cultural_values' }
      ]
    }
  };

  // iterate through results and
  // organize into correct attributes
  function organize(result) {
    for(var key in attributes) {
      if(attributes.hasOwnProperty(key)) {
        assignResult(key);
        final_score += attributes[key].score;
      }
    }

    function assignResult(key) {
      var layers = attributes[key].layers;
      attributes[key].score = 0; // init 0
      for(var i = 0; i < layers.length; i++) {
        layers[i].breakdown = result[layers[i].name];
        // score is the greatest of all layers in 
        // a particular variable
        // stats = are for treatment area
        // summary = is for entire study area
        var scores = getScores(layers[i].breakdown.stats);
        scores.sort().reverse();
        if(scores[0] > attributes[key].score) {
          attributes[key].score = +scores[0];
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
  }

  return declare(null, {
    constructor : function (url) {
      this.gp = new GP(url);
    },
    runAnalysis : function (input_json, cb) {
      var that = this;
      this.gp.execute({json_input : input_json}, function (res, mes) {
        that.results = res[0].value;
        organize(that.results);
        cb.call(that, that.results);
      });
    },
    getScore : function () {
      return final_score;
    },
    getResult : function () {
      return attributes;
    }
  })
})
