var image = ee.Image('LANDSAT/LC8_L1T_TOA/LC80440342014077LGN00')
Map.centerObject(image, 14)

var geometry = Map.getBounds(true)
print(geometry)
var training = image.sample({region: geometry, scale: 30, numPixels: 500})
var classified = image.cluster(ee.Clusterer.wekaKMeans(8).train(training)).rename('class');
var palette = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']
Map.addLayer(classified, {min:1, max:8, palette:palette}, 'Unsupervised Classification')

var bands = ['B1','B2','B3','B4','B5','B6','B7','B8']
// print(classified)
// var chart = ui.Chart.image.byClass(image.addBands(classified), 'class', geometry//.aside(print)//, null, 30, null, null).aside(print)
// print(chart)
// ui.Chart.image.byClass(image, classBand, region, reducer, scale, classLabels, xLabels)

var chart = ui.Chart.image.byClass({image:image.select(bands).addBands(classified), classBand:'class', region:ee.Feature(geometry)})
print(chart)
// function computeStatistics(image, clusterImage) {
//   var numClasses =  clusterImage.reduceRegion({
//                   geometry: geometry,
//                   reducer: ee.Reducer.max(),
//                   scale: 30,
//                   bestEffort: true,
//                   maxPixels: 1e6,
//                 });

//   var classes = ee.List.sequence(0, numClasses.get('cluster')).map(function(i) {
//     var oneClass = image.mask(clusterImage.eq(ee.Number(i)));

//     var reducer = ee.Reducer.mean()
//     // .combine(ee.Reducer.median(), null, true)
//     // .combine(ee.Reducer.max(), null, true)
//     // .combine(ee.Reducer.min(), null, true)
//     .combine(ee.Reducer.stdDev(), null, true);

//     var stats = oneClass.reduceRegion({
//                   geometry: geometry,
//                   reducer: reducer,
//                   scale: 30,
//                   bestEffort: true,
//                   maxPixels: 1e6,
//                 });
    
//     return ee.Feature(null, stats);
    
//   });
  
//   return classes;
// } 

// print(image)
// var stats = computeStatistics(image, classified, 8);
// print('stats', stats); // look in properties

// var profile = ee.List.sequence(1,8).map(function(i){
//   i = ee.Number(i).int(); // need to cast to number and int
  
//   return image_stack
//     .updateMask(memb.eq(i))
//     .reduceRegion({
//         reducer: ee.Reducer.mean(), 
//         geometry: memb.geometry(),
//         scale: 5000, // pixel size
//         bestEffort: true
//       });
// });

// print(profile);
// var arry = ee.List.sequence(1,8).map(function (i) {
//   i = ee.Number(i).int();
//   var classData = ee.Dictionary(profile.get(i.subtract(1)));
  
//   return ee.List(classData.toArray());//.map(function (v) {return ee.Number(v).int();});

// });

// print(arry);
// print(Chart.array.values(arry, 1))
// var fc = ee.FeatureCollection(profile.map(function (f){ return ee.Feature(null, f); }));

// print(Chart.feature.byProperty(fc));