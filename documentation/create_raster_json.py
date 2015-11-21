# name : create_raster_json2.py
# author : Joshua Tanner
# description : mask rasters by input polygon and return results

# todo: accept input geometry for mask

# Import arcpy module
import arcpy
import json

# Input treatment area, use provided example in SDE by default
if(not arcpy.GetParameter(1)):
    Treatment_Poly = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Layers\\gpt_db.db_user.Treatment_Example"
else:
    user_input_poly = json.loads(arcpy.GetParameterAsText(1))
    Treatment_Poly = arcpy.AsShape(user_input_poly, True)
    
# Raster analysis layers
Resistance_to_Control = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_ResToCont"
Powerlines = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Powerlines"
Pipelines = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Pipelines"
Facilities = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_NPS_Facilities"
Private_Structures = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Private_Structures"
Private_Community = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Private_Community"
Distance_to_Developed_Areas = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Distnace_To_Developed_Areas"
Fire_Continuity = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Fire_Continuity"
Fire_Dependent_T_E_Species = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Aster_Turkeybeard"
Unique_and_Rare_T_E = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Bobwhite_Quail"
Cultural_Values = "Database Connections\\gpt_db.sde\\gpt_db.db_user.KIMO_Cultural_Values"

# Output JSON (python dict)
# contains each variable, scores, and individual score descriptions
score_output = {}

# Layers to perform analysis on
layers = [{ 'name' : 'resistance_to_control', 'loc' : Resistance_to_Control },
          { 'name' : 'powerlines', 'loc' : Powerlines },
          { 'name' : 'pipelines', 'loc' : Pipelines },
          { 'name' : 'facilities', 'loc' : Facilities },
          { 'name' : 'private_structure', 'loc' : Private_Structures },
          { 'name' : 'private_community', 'loc' : Private_Community },
          { 'name' : 'distance_to_developed_areas' , 'loc' : Distance_to_Developed_Areas },
          { 'name' : 'fire_continuity', 'loc' : Fire_Continuity },
          { 'name' : 'fire_dependent_t_e_species', 'loc' : Fire_Dependent_T_E_Species },
          { 'name' : 'unique_and_rare_t_e', 'loc' : Unique_and_Rare_T_E },
          { 'name' : 'cultural_values', 'loc' : Cultural_Values }
          ]

# Set Geoprocessing environments
arcpy.env.outputCoordinateSystem = "PROJCS['WGS_1984_Web_Mercator_Auxiliary_Sphere',GEOGCS['GCS_WGS_1984',DATUM['D_WGS_1984',SPHEROID['WGS_1984',6378137.0,298.257223563]],PRIMEM['Greenwich',0.0],UNIT['Degree',0.0174532925199433]],PROJECTION['Mercator_Auxiliary_Sphere'],PARAMETER['False_Easting',0.0],PARAMETER['False_Northing',0.0],PARAMETER['Central_Meridian',0.0],PARAMETER['Standard_Parallel_1',0.0],PARAMETER['Auxiliary_Sphere_Type',0.0],UNIT['Meter',1.0]]"

def getStats(name, loc):
    score_output[name] = {'summary' : {}, 'stats' : {}}
    # get score descriptions for variable
    for row in arcpy.da.SearchCursor(loc, '*'):
        score_output[name]['summary'][row[1]] = { 'total' : row[2], 'desc' : row[3] }
    # get masked stats    
    mask = arcpy.gp.ExtractByMask_sa(loc, Treatment_Poly)
    for row in arcpy.da.SearchCursor(mask, '*'):
        score_output[name]['stats'][row[1]] = { 'total' : row[2], 'desc' : row[3] }

#getStats('resistance_to_control', Resistance_to_Control)

for layer in layers:
    getStats(layer['name'], layer['loc'])

arcpy.SetParameter(0, json.dumps(score_output))
