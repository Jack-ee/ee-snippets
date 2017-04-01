/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("users/JustinPoehnelt/sentinel_ndvi_image_1466195511191");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var bands = [3,22,32],
    MAX_OBJECT_SIZE = 256,
    THRESHOLD_START = 0,
    THRESHOLD_END = 0.3,
    THRESHOLD_STEP = 0.05,
    USE_COSINE = false;
    
var geometry = image.geometry();
Map.addLayer(image,{},'all');    
Map.addLayer(image.select(bands),{})
image = image.fastGaussianBlur(8);
Map.addLayer(image.select(bands),{})

// image = image.select(bands);

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
var exportId = 'sgmnts_' + Date.now().toString();
Export.image.toAsset({
  image:results.select("^(cl).*$").int64(), 
  assetId: exportId,
  description: exportId,
  region: geometry,
  scale:10,
  maxPixels: 1e13
});

var canny = ee.Algorithms.CannyEdgeDetector(image, 0.005).reduce(ee.Reducer.sum());
// Mask the image with itself to get rid of 0 pixels.
// canny = canny.updateMask(canny);
Map.addLayer(canny,{min:0,max:5}, 'Canny Blur')
