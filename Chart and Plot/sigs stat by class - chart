var geometry = /* color: #00ffff */ee.Geometry.Polygon(
        [[[103.00609970676544, 5.080687938498982],
          [102.97999389449274, 5.082056531970339],
          [102.97552846810947, 5.057421487138437],
          [103.00575617406821, 5.056395011958857]]]),
    l8_toa = ee.ImageCollection("LANDSAT/LC8_L1T_8DAY_TOA");
    
/*

Author: Justin Poehnelt
Date: March 15, 2015

*/

var NUM_CLUSTERS = 20;

// image you are using
var image = l8_toa.mean().clip(geometry);

// features to train cluster
var trainingFeatures = image.sample({
  region:geometry,
  scale:30,
  numPixels: 5e6 
});

// cluster with minimal parameters
var clusterer = ee.Clusterer.wKMeans({nClusters: NUM_CLUSTERS});
clusterer = clusterer.train(trainingFeatures)

// image classified
var clusterImage = image.cluster(clusterer)
var stats = computeStatistics(image, clusterImage, NUM_CLUSTERS);
print('stats', stats); // look in properties

Map.centerObject(geometry)
Map.addLayer(clusterImage, {min:0, max: NUM_CLUSTERS});


function computeStatistics(image, clusterImage) {
  var numClasses =  clusterImage.reduceRegion({
                  geometry: geometry,
                  reducer: ee.Reducer.max(),
                  scale: 30,
                  bestEffort: true,
                  maxPixels: 1e6,
                });

  var classes = ee.List.sequence(0, numClasses.get('cluster')).map(function(i) {
    var oneClass = image.mask(clusterImage.eq(ee.Number(i)));

    var reducer = ee.Reducer.median()
    .combine(ee.Reducer.mean(), null, true)
    .combine(ee.Reducer.max(), null, true)
    .combine(ee.Reducer.min(), null, true)
    .combine(ee.Reducer.stdDev(), null, true);

    var stats = oneClass.reduceRegion({
                  geometry: geometry,
                  reducer: reducer,
                  scale: 30,
                  bestEffort: true,
                  maxPixels: 1e6,
                });
    
    return ee.Feature(null, stats);
    
  });
  
  return classes;
}  

print(stats)
// Export.table(stats, 'class_stats', {driveFolder: ''}); 