/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var S2 = ee.ImageCollection("COPERNICUS/S2"),
    S2grid = ee.FeatureCollection("ft:1SaoY60_I5_JUKepshvJwJrNizMQ4hOh1qCZb3csm"),
    point = /* color: #ff0000 */ee.Geometry.Point([90.63179969787598, 30.564884607951356]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//Selecting Sentinel 2 bands and tile of interest (containing a given point), display the tile footprint
var bands = ['B2', 'B3', 'B4', 'B8'];
var selected = S2grid.filterBounds(point);
var MGRS = selected.reduceColumns(ee.Reducer.first(),['name']).get('first');
print(MGRS);
Map.centerObject(selected, 9);
Map.addLayer(selected, {'color': 'yellow'}, 'Selected tile');

//Setting imagery viz params
var vizTC = {
  bands: ['B4', 'B3', 'B2'],
  min: 500,
  max: 5000,
  gamma: 1.5
};

// Filtering collection
var FilterCol = S2
  .filterDate('2015-06-01', '2017-01-10')
  .filter(ee.Filter.calendarRange(10,5,'month'))
  //.filterBounds(selected)
  .filterMetadata('MGRS_TILE', 'equals', MGRS)
  .filterMetadata('MEAN_INCIDENCE_AZIMUTH_ANGLE_B1', 'greater_than', 200)
  .sort('CLOUDY_PIXEL_PERCENTAGE',false)
  ;
  
print('Number of retrieved images:', FilterCol.size());
print('Filtered collection:', FilterCol);

//Display imagery
Map.addLayer(FilterCol.median(), vizTC, 'True color composite');

