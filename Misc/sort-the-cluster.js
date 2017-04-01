/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-106.23944784843735, 37.87923153331486],
          [-106.33488235362978, 37.6999581507268],
          [-106.04375035945043, 37.507378829484004],
          [-105.80338390464544, 37.63520425158253],
          [-105.89062781923894, 37.8564703032896]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// A nice  palette.
var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'];

// Just display the image with the palette.
var image = ee.Image('LT5_L1T_8DAY_NDVI/20110618');
Map.addLayer(image, {min: 0, max: 1, palette: palette}, 'Landsat NDVI');

var training = image.sample(geometry, 30)

// Build the kMeans from training data.
var model = ee.Clusterer.wekaKMeans(5)
    .train(training)
    
var cImage = image.cluster(model)
Map.addLayer(cImage, {min:0, max:4}, "Raw clusters")

// Recluster the training data and compute the mean for each cluster.
var clusters = training.cluster(model, "cluster")
var groups = clusters.reduceColumns(ee.Reducer.mean().group(0), ["cluster", "NDVI"])
print(groups)

// Extract the cluster IDs and the means.
groups = ee.List(groups.get("groups"))
var ids = groups.map(function(d) { 
  return ee.Dictionary(d).get('group')
})
var means = groups.map(function(d) { 
  return ee.Dictionary(d).get('mean')
})

// Sort the IDs using the means as keys.
var sorted = ee.Array(ids).sort(means).toList()
print(sorted)

// Remap the clustered image to put the clusters in order.
var ordered = cImage.remap(sorted, ids)
Map.addLayer(ordered, {min:0, max:4}, "Sorted clusters")


