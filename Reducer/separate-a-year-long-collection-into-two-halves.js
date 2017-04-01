/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.MultiPoint(
        [[-122.1514892578125, 37.748322027789115],
         [-121.3714599609375, 38.62049175671215]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//Parameters
// b: background NDVI
// Ae: amplitude (Max NDVI - background)
// x:target DOY
// u: DOY of peak NDVI
// o:stdev (two stdev: one prior to peak, one after peak)

var delta = ee.Geometry.Rectangle(-122.1514892578125,37.748322027789115,-121.3714599609375,38.62049175671215); 

// Mask coulds
var maskClouds = function(img) {
  var cloudscore = ee.Algorithms.Landsat.simpleCloudScore(img).select('cloud');
  return img.mask(cloudscore.lt(50));
};

// Add an NDVI band.
var addDOY = function(img){
  var date = ee.Date(img.get('system:time_start'));
    // Make an image out of the DOY.
    var doy = ee.Image(ee.Date(img.get('system:time_start'))
        .getRelative('day', 'year')
        .short())
        .rename('DOY').int();
  var ndvi = img.normalizedDifference(['B5', 'B4']) // change when working with other Landsat data
      .select([0], ['NDVI']).float();
    // Add DOY and NDVI bands
  return maskClouds(img).addBands(ndvi).addBands(doy);
};

//First step : find annual time series
var start = '2014-01-01';
var end = '2015-01-01';
var bstart = '2013-11-01'
var bend = '2014-03-01'
var imgs = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
  .filterDate(start, end)
  .filterBounds (delta)
  .map(addDOY);
print (imgs)

//Background NDVI
var b = ee.ImageCollection('LANDSAT/LC8_L1T_8DAY_EVI')
  .filterDate(start, end)
  .filterBounds (delta)
  .reduce(ee.Reducer.mean());

//Amplitude
var max = imgs.qualityMosaic('NDVI');
var Ae = max.select('NDVI').subtract(b.select('NDVI'));

//u (DOY of peak NDVI)
var u = max.select('DOY')

//Separate time series into two parts, one half before peak greenness and the second part after peak greenness
var beforePeak = imgs.map(function(image) {
  return image.updateMask(image.select('DOY').lte(u))}).select('NDVI');

var beforeStDev = beforePeak.reduce(ee.Reducer.mean());
print(beforeStDev,'before')
Map.addLayer(beforeStDev)

var afterPeak = imgs.map(function(image) {
  return image.updateMask(image.select('DOY').gt(u));
}).select('NDVI');

var AfterStDev = afterPeak.select('NDVI').reduce(ee.Reducer.std_dev());
Map.addLayer(AfterStDev)




