// var roi = Map.getBounds(true)
// // ee.FeatureCollection.randomPoints(region, points, seed, maxError)
// var random = ee.FeatureCollection.randomPoints(roi, 5e2, 10)
// .map(function (f) {
//     f = f.set('x',f.geometry().centroid().coordinates().get(0));
//     f = f.set('y',f.geometry().centroid().coordinates().get(1));
//   return f;
// });

// var confusionMatrix = random.randomColumn('r1',4).randomColumn('r2',3)
// .map(function (f){
//   return f.set('truth', ee.Number(f.get('r1')).gte(0.5)).set('pred', ee.Number(f.get('r2')).gte(0.5));
// }).errorMatrix('truth', 'pred');
var ft = ee.FeatureCollection('ft:1wUJ-s-G9xbCOJHwMlOIEa2WMclyFAl2IdgVViMjE')
var confusionMatrix = ft.errorMatrix('class', 'type');
print('Confusion Matrix', confusionMatrix);
print('Accuracy', confusionMatrix.accuracy());
print('Consumers Accuracy', confusionMatrix.consumersAccuracy());
print('Producers Accuracy', confusionMatrix.producersAccuracy());
print('Kappa', confusionMatrix.kappa());

Export.table.toDrive({
  folder: 'fusiontable',
  description: 'testConfusionMatrixExport',
  fileFormat: 'csv',
  collection: ee.FeatureCollection([ee.Feature(null, {'matrix':ee.Array(confusionMatrix.array()).toList()})])
})