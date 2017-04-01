/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var sentinel = ee.ImageCollection("COPERNICUS/S2"),
    geometry = /* color: 98ff00 */ee.Geometry.Polygon(
        [[[-123.4326839656569, 38.88389145502088],
          [-119.78041650960222, 38.44082394805463],
          [-120.62808038899675, 41.68964962772258],
          [-124.06740190694109, 41.52208052408492]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var PERIOD_LENGTH = 200,
    START = '2015-8-01', 
    END = '2016-07-01',
    MAX_OBJECT_SIZE = 256,
    THRESHOLD_START =200,
    THRESHOLD_END = 1000,
    THRESHOLD_STEP = 100,
    USE_PIXELCOORDS = false,
    USE_COSINE = false,
    // BANDS = ["B2","B3","B4","B5","B6","B7","B8","B11","B12","B_NDVI","B_PAN_ND","B_NDWI"];
    BANDS = ["B_NDVI","B_PAN_ND","B_NDWI"];
        // BANDS = ["B_NDVI"];
 
    
print(ee.List.sequence(THRESHOLD_START,THRESHOLD_END,THRESHOLD_STEP))


var serializedParameters = [
  START,END,
  PERIOD_LENGTH.toString(),
  MAX_OBJECT_SIZE.toString(),
  USE_COSINE.toString(),
  THRESHOLD_START.toString(),
  THRESHOLD_END.toString(),
  THRESHOLD_STEP.toString(),
  BANDS.toString()
  ].join("_").replace(/-/g,"_").replace(/,/g,"").replace(/0\./g,"");

print(serializedParameters)
//// TODO ////
// 1. Handle masked bands in region grow
// 2. Detect roads?

var collection = sentinel
  // .filterDate(START,END)
  // .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', 10)
  // .filterBounds(geometry)
  .map(function(img) {
    img = img.addBands(img.normalizedDifference(['B8', 'B4']).multiply(10000).select([0],['B_NDVI']));
    img = img.addBands(img.select('B2').add(img.select('B3')).add(img.select('B3')).divide(3).select([0],['B_PAN']))
    img = img.addBands(img.normalizedDifference(['B8', 'B_PAN']).multiply(10000).select([0],['B_PAN_ND']))
        img = img.addBands(img.normalizedDifference(['B11', 'B8']).multiply(10000).select([0],['B_NDWI']))

    return img;
  })
  .select(BANDS)

/**
 * getPeriods() is a utility for creating equally 
 * spaced dates given a beginning and ending year
 * 
 * @param {Integer} begin
 * @param {Integer} end
 * @param {Integer} length
 * @return {ee.List} dates
 */
function getPeriods(begin, end, length){
  begin = new Date(begin)
  end = new Date(end);


  var dates = [];


  while(begin.getTime() < end.getTime()) {
    dates.push(ee.Date(begin));
    begin = new Date(begin.setDate(begin.getDate() + length));
  }
  
  return ee.List(dates);
}

/**
 * mosaicCollection() returns a uniform collection of 
 * mosaics over a list of periods
 *
 * @param {ee.ImageCollection} collection
 * @param {ee.List} periods
 * @return {ee.ImageCollection} collection
 */
function mosaicCollection(collection, periods) {
  collection = ee.ImageCollection(periods.map(function(dt) {
    // Select a subset of the collection based upon the period
    var subset = collection.filterDate(dt, ee.Date(dt).advance(PERIOD_LENGTH, 'day')).median();
    subset = subset.set('system:time_start',ee.Date(dt));
    return subset;
  }));  
  return collection;
}


// mosaic the periods
var periods = getPeriods(START, END, PERIOD_LENGTH);
collection = mosaicCollection(collection, periods);
Map.addLayer(collection,{}, 'collection',0);

// convert images to bands
var list = collection.toList(100);
var image = ee.Image(list.slice(1).iterate(function(a, b){return ee.Image(b).addBands(a);}, list.get(0)));

if (USE_PIXELCOORDS) {
  image = image.addBands(ee.Image.pixelCoordinates(ee.Projection("epsg:3857")).multiply(0.5).select([0,1],["B_X", "B_Y"]))
}


// This field contains UNIX time in milliseconds.
var timeField = 'system:time_start';


var addVariables = function(image) {
  // Compute time in fractional years since the epoch.
  var date = ee.Date(image.get(timeField));
  var years = date.difference(ee.Date('1970-01-01'), 'year');
  // Return the image with the added bands.
  return image
    // Add an NDVI band.
    .addBands(image.normalizedDifference(['B8', 'B4']).rename('NDVI')).float()
    // Add a time band.
    .addBands(ee.Image(years).rename('t').float())
    // Add a constant band.
    .addBands(ee.Image.constant(1));
};

// Remove clouds, add variables and filter to the area of interest.
sentinel = sentinel
  // .filterBounds(roi)
  // .map(maskClouds)
  .map(addVariables);

// List of the independent variable names
var independents = ee.List(['constant', 't']);

// Name of the dependent variable.
var dependent = ee.String('NDVI');


// Use these independent variables in the harmonic regression.
var harmonicIndependents = ee.List(['constant', 't', 'cos', 'sin']);

// Add harmonic terms as new image bands.
var harmonicsentinel = sentinel.map(function(image) {
  var timeRadians = image.select('t').multiply(2 * Math.PI);
  return image
    .addBands(timeRadians.cos().rename('cos'))
    .addBands(timeRadians.sin().rename('sin'));
});

// The output of the regression reduction is a 4x1 array image.
var harmonicTrend = harmonicsentinel
  .select(harmonicIndependents.add(dependent))
  .reduce(ee.Reducer.linearRegression(harmonicIndependents.length(), 1));
  
// Turn the array image into a multi-band image of coefficients.
var harmonicTrendCoefficients = harmonicTrend.select('coefficients')
  .arrayProject([0])
  .arrayFlatten([harmonicIndependents]);

// Compute phase and amplitude.
var phase = harmonicTrendCoefficients.select('cos').atan2(
            harmonicTrendCoefficients.select('sin'));
            
var amplitude = harmonicTrendCoefficients.select('cos').hypot(
                harmonicTrendCoefficients.select('sin'));
                
                
var rgb = phase.unitScale(-Math.PI, Math.PI).addBands(
          amplitude.multiply(2.5)).addBands(
          ee.Image(1)).hsvToRgb();
Map.addLayer(rgb, {}, 'phase (hue), amplitude (saturation)');

image = image.addBands(phase.multiply(1000).select([0],['B_PHASE']))
image = image.addBands(amplitude.multiply(1000).select([0],['B_AMPLITUDE']))

image = image.focal_mean({
  radius: 0.75,
  kernelType: 'square',
  iterations: 1
});

Map.addLayer(image.select("B_PAN_ND"), {min:0, max:10000}, 'pan nd', 0);
Map.addLayer(image, {}, 'image', 0);


var results = ee.Image(ee.List.sequence(THRESHOLD_START,THRESHOLD_END,THRESHOLD_STEP).iterate(function(threshold, image) {
  threshold = ee.Number(threshold);
  image = ee.Image(image);
  
  var imageClustered = ee.apply("Test.Clustering.RegionGrow", {
    "image": image.select("^(B).*$"),
    "useCosine": USE_COSINE,
    secondPass: true,
    "threshold": threshold,
    "maxObjectSize": MAX_OBJECT_SIZE,
  });
  
  var imageConsistent = ee.apply("Test.Clustering.SpatialConsistency", {
    "image": imageClustered,
    "maxObjectSize": MAX_OBJECT_SIZE
  })
  
  imageConsistent = ee.apply("Test.Clustering.SpatialConsistency", {
    "image": imageConsistent,
    "maxObjectSize": MAX_OBJECT_SIZE
  })

  imageConsistent = imageConsistent.select("^(B).*$").addBands(imageConsistent.select('clusters'))
  
  return ee.Image(ee.Algorithms.If(image.bandNames().contains('clusters'), imageConsistent.addBands(image.select("^(cl).*$")), imageConsistent));
}, image));

// Visualize All Levels
var hierarchy = results.select("^(cl).*$").bandNames().getInfo();
for (var i = 0; i< hierarchy.length; i++) {
  Map.addLayer(results.select(hierarchy[i]).randomVisualizer(),{},hierarchy[i],0);
}

// Map.addLayer(results.select("^(cl).*$"),{}, 'results',0);

// Export 
var exportId = 'sgmnts_' + Date.now().toString() + '_' + serializedParameters;
Export.image.toAsset({
  image:results.select("^(cl).*$").int64(), 
  assetId: exportId,
  description: exportId,
  region: geometry,
  scale:10,
  maxPixels: 1e13
});


// Kmeans
// var NUM_CLUSTERS = 10;
// var trainingFeatures = image.sample({
//   region: geometry,
//   scale:10,
//   numPixels: 5e6 
// });

// // cluster with minimal parameters
// var clusterer = ee.Clusterer.wKMeans({nClusters: NUM_CLUSTERS});
// clusterer = clusterer.train(trainingFeatures)
// var kmeans = image.cluster(clusterer)
// Map.addLayer(kmeans.select('cluster').randomVisualizer(), {}, 'kmeans');