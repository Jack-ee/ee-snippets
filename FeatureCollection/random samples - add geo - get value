var roi = Map.getBounds(true)
// ee.FeatureCollection.randomPoints(region, points, seed, maxError)
var random = ee.FeatureCollection.randomPoints(roi, 5e2, 10)
.map(function (f) {
    f = f.set('x',f.geometry().centroid().coordinates().get(0));
    f = f.set('y',f.geometry().centroid().coordinates().get(1));
   return f;
});

Export.table.toDrive({
  collection: random.select(['x', 'y'], null, false),
  description: 'randomPoints',
  folder: 'fusiontable',
  fileNamePrefix: 'randomPoints2000Europe3',
  fileFormat: 'csv'
})