// treatment class
// abstract out methods to generate score
// and other stuff

define(["dojo/_base/declare", "esri/tasks/Geoprocessor"],
function (declare, GP) {
  // private objects
  var study_area_stats = undefined;
  var final_score = undefined;
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
    console.log(result);
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
    getStudyAreaStats : function () {
      return study_area_stats;
    },
    getResult : function () {
      return attributes;
    }
  })
})
