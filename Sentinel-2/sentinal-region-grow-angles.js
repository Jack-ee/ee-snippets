/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var sentinel = ee.ImageCollection("COPERNICUS/S2"),
    geometry = /* color: ffc82d */ee.Geometry.Polygon(
        [[[-3.2564163208007812, 33.4386348485769],
          [3.2701492309570312, 34.99319027261741],
          [3.2540130615234375, 36.97214207343772],
          [-3.7882232666015625, 35.52974174046386]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
////// Constants //////
var START_YEAR = 2015;
var END_YEAR = 2016;
var MAX_OBJECT_SIZE = 256,
    THRESHOLD_START =.5,
    THRESHOLD_END = 1.5,
    THRESHOLD_STEP = 0.5,
    USE_COSINE = false,
    USE_PIXELCOORDS = false;
    
    
sentinel = sentinel.filterDate(START_YEAR.toString() + '-01-01', END_YEAR.toString() + '-12-31')
  .map(function(img) {
  // Opaque and cirrus cloud masks cause bits 10 and 11 in QA60 to be set,
  // so values less than 1024 are cloud-free
  var mask = ee.Image(0).where(img.select('QA60').gte(1024), 1).not();
  return img.updateMask(mask);
})
  .map(function(img) {
    return img.select(['B4','B8'], ['red', 'nir']);
  });


var collection = sentinel;

// w is reference point for green and brightness
// brightness if reference point for green
// [red, nir] TODO find actual values
var g = [.02, .61];
var b = [.41, .47];
var w = [.025, .05];

var angle_w_b = ee.Number((b[1] - w[1]) /(b[0] - w[0])).atan().multiply(180).divide(Math.PI);
var angle_w_g = ee.Number((g[1] - w[1]) /(g[0] - w[0])).atan().multiply(180).divide(Math.PI);

var temp = collection;
var mean = temp.mean();

temp = temp.map(function (img) {
  var nir = img.select('nir');
  var red = img.select('red');

  var aw = nir.subtract(w[1]).divide(red.subtract(w[0])).atan().multiply(180).divide(Math.PI).subtract(angle_w_b);
  var ab = ee.Image(angle_w_b).subtract(nir.subtract(b[1]).divide(red.subtract(b[0])).atan().multiply(180).divide(Math.PI));
  var ag = nir.subtract(g[1]).divide(red.subtract(g[0])).atan().multiply(180).divide(Math.PI).subtract(angle_w_g);

  var dw = nir.subtract(w[1]).pow(2).add(red.subtract(w[0]).pow(2)).sqrt();
  var db = nir.subtract(b[1]).pow(2).add(red.subtract(b[0]).pow(2)).sqrt();
  var dg = nir.subtract(g[1]).pow(2).add(red.subtract(g[0]).pow(2)).sqrt();
  
  // distance from point p
  var distance = mean.select('nir').subtract(nir).pow(2).add(mean.select('red').subtract(red).pow(2)).sqrt();
  
  return img.select([])
    .addBands(distance.select([0], ['distance']))
    .addBands(aw.select([0], ['aw']))
    .addBands(ab.select([0], ['ab']))
    .addBands(ag.select([0], ['ag']))
    // .addBands(dw.select([0], ['dw']))
    // .addBands(db.select([0], ['db']))
    // .addBands(dg.select([0], ['dg']))
    .addBands(img.normalizedDifference(['nir', 'red']).select([0], ['ndvi']));
});


var reducer = ee.Reducer.median()
    // .combine(ee.Reducer.mean(), null, true)
    // .combine(ee.Reducer.sum(), null, true)
    .combine(ee.Reducer.max(), null, true)
    .combine(ee.Reducer.min(), null, true)
    // .combine(ee.Reducer.stdDev(), null, true);
    
var out = temp.reduce(reducer, 1);


var maxVals = out.reduceRegion({
  reducer: ee.Reducer.max(), 
  geometry: geometry, 
  scale: 10000,
  bestEffort: true
  });


var normalized = ee.Image(out.bandNames().iterate(function (band, img) {
  img = ee.Image(img)
  band = ee.String(band);
  return img.addBands((out.select(band).divide(ee.Number(maxVals.get(band)).abs()).float().select([0],[ee.String("B_").cat(band).cat("_norm")])));
}, out.select([])));

var image = normalized;

image = image.focal_mean({
  radius: 1.5,
  kernelType: 'square',
  iterations: 1
});

if (USE_PIXELCOORDS) {
  image = image.addBands(ee.Image.pixelCoordinates(ee.Projection("epsg:3857")).multiply(0.0005).select([0,1],["B_X", "B_Y"]))
}
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

Map.addLayer(image,{}, 'image',0);

// Export 
var exportId = 'sgmnts_' + Date.now().toString();
Export.image.toAsset({
  image:results.select("^(cl).*$").int64(), 
  assetId: exportId,
  description: exportId,
  region: geometry,
  scale:10,
  maxPixels: 1e13
});

