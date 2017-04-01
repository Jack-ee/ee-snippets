var image = ee.Image('LE7_TOA_1YEAR/2001')
var region = ee.Geometry.Rectangle(29.7, 30, 32.5, 31.7);
var training = image.sample({
  region: region,
  scale: 30,
  numPixels: 5000
})

var data = image.sample({
  region: region,
  scale: 30,
  numPixels: 800
})
// print(data)
var clusterer = ee.Clusterer.wekaKMeans(25).train(training)
var result = data.cluster(clusterer)
print(result)
// var result = image.cluster(clusterer);
// Map.addLayer(result.randomVisualizer())
