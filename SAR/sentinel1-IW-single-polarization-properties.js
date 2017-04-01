// Sentinel-1 IW single polarization properties

var point = ee.Geometry.Point([6,51]);
var collection = 
ee.ImageCollection('COPERNICUS/S1_GRD')
.filterBounds(point) 
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
.filter(ee.Filter.eq('resolution_meters', 10))
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));
 
var image = ee.Image(collection.first()).select('VV');

print('MinMax');
var geom = image.geometry();
var reduce_params = {reducer: ee.Reducer.minMax(), geometry: geom, scale: 10, maxPixels: 1e9};
var minmax = image.reduceRegion(reduce_params);

print('Max:',minmax.get('VV_max'))
print('Min:',minmax.get('VV_min'))

var reduce_params = {reducer: ee.Reducer.mean(), geometry: geom, scale: 10, maxPixels: 1e9};
var mean = image.reduceRegion(reduce_params);

print('Mean:',mean.get('VV'))

