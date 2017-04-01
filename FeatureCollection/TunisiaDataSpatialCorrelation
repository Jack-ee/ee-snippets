/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var tunisia = ee.FeatureCollection("ft:1VARNFyjUQ0M8EUniP2PXHddJy1WlxLjOikDSeQ2k"),
    day2 = ee.FeatureCollection("ft:12xi9lhWd5KlYJWFVYsnwSjvjwHvoAVvXIS0B5T9A"),
    team1 = ee.FeatureCollection("ft:17292iM-NUveLIlezD7FIiOhdj4-_owthhuobpbYM"),
    team2 = ee.FeatureCollection("ft:137l6NeI4O3L0BRJNFMQIAH4riF12MhZql14zy47f");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var lookup = { true: 1, false: 0};
var pts = ee.Image(0).byte().paint(day2.merge(team1).merge(team2).map(function(f) {return f.buffer(5);}),1);
pts = pts.mask(pts.eq(1));

var mobile_app_training = ee.FeatureCollection('ft:1C_gFvQmd3AGtB0Q0XgnKk5ESUARSH79FB9Un8sF2')
  .filter(ee.Filter.eq('source_type','ground'))
  .filter(ee.Filter.contains('source_description','mobile'))
  .filter(ee.Filter.eq('country','Tunisia'))
  .map(function(f) {
    return f.set('Is_Validation', 0).set('mobile', 1);
  });
  
var mobile_app_validation = ee.FeatureCollection('ft:12WLGpk7o1ic_j88NQfmrUEILVWDlrJaqZCAqEDeo')
  .filter(ee.Filter.eq('source_type','ground'))
  .filter(ee.Filter.contains('source_description','mobile'))
  .filter(ee.Filter.eq('country','Tunisia'))
  .map(function(f) {
    return f.set('Is_Validation', 1).set('mobile', 1);
  });
  
var paper_training = ee.FeatureCollection('ft:1C_gFvQmd3AGtB0Q0XgnKk5ESUARSH79FB9Un8sF2')
  .filter(ee.Filter.contains('source_description','murali_tunisia_field_visit_2016'))
  .filter(ee.Filter.eq('country','Tunisia'))
  .map(function(f) {
    return f.set('Is_Validation', 0).set('mobile', 0);
  });
  
var paper_validation = ee.FeatureCollection('ft:12WLGpk7o1ic_j88NQfmrUEILVWDlrJaqZCAqEDeo')
  .filter(ee.Filter.contains('source_description','murali_tunisia_field_visit_2016'))
  .filter(ee.Filter.eq('country','Tunisia'))
  .map(function(f) {
    return f.set('Is_Validation', 1).set('mobile', 0);
  });
var tunisia_mobile = mobile_app_validation.merge(mobile_app_training);  
var tunisia_training = tunisia.filter(ee.Filter.eq('Is_Validation',0));
var tunisia_validation = tunisia.filter(ee.Filter.eq('Is_Validation',1));

var mapping_units = paper_validation.merge(paper_training).merge(mobile_app_validation).merge(mobile_app_training).map(function (f) {return f.buffer(45).bounds(); });
Map.addLayer(mapping_units, {}, 'mapping units');

Map.addLayer(paper_training, {color:'00ff00'}, 'training');
Map.addLayer(paper_validation, {color:'ff0000'}, 'validation');
Map.addLayer(mobile_app_validation, {color:'ff00ff'}, 'mobile validation');
Map.addLayer(mobile_app_training, {color:'00ffff'}, 'mobile training');

Map.addLayer(pts,{palette: 'ffff00'}, 'pts');

throw 'stop';

// tunisia = tunisia.select(['Is_Validation']).merge(mobileApp.select(['Is_Validation']));

var route = day2.select([]).merge(team1.select([])).merge(team2.select([]));



// lets see how far the sample is from the route
var within = ee.Filter.withinDistance({
  distance: 200,
  leftField: '.geo',
  rightField: '.geo',
  maxError: 1e-5
});

var join = ee.Join.saveAll({
  matchesKey: 'route_points',
  measureKey: 'distance'
});

tunisia = ee.FeatureCollection(join.apply(tunisia, route, within))
            .map(function(f) {
              return f.set('num_route_points', ee.List(f.get('route_points')).length());
            });


// this checks samples that are too close together(correlation issues)
var filter = ee.Filter.withinDistance({
  distance: 500,
  leftField: '.geo',
  rightField: '.geo',
  maxError: 1e-5
});

var join = ee.Join.saveAll({
  matchesKey: 'neighbors',
  measureKey: 'distance'
});


var tunisia_training = tunisia.filter(ee.Filter.eq('Is_Validation',0));
var tunisia_validation = tunisia.filter(ee.Filter.eq('Is_Validation',1));
var tunisia_mobile = tunisia.filter(ee.Filter.eq('Is_Validation',2));
var tunisia_correlation = join.apply(tunisia_validation, tunisia_training, filter);


// Map.addLayer(tunisia, {color:"FFFF00"}, 'points');
Map.addLayer(route, {}, 'routes');
Map.addLayer(tunisia_training, {color:'00FF00'}, 'Training (Green)');
Map.addLayer(tunisia_validation, {color:'0000FF'}, 'Validation (Blue)');
Map.addLayer(tunisia_mobile, {color:'00FFFF'}, 'Mobile (Cyan)');
Map.addLayer(tunisia_correlation, {color:"FF0000"}, 'Correlation Issues (Red)');
Map.centerObject(tunisia_correlation);

print(tunisia_training.size());
print(tunisia_validation.size().subtract(tunisia_correlation.size()));


// print(Chart.feature.histogram(
//   tunisia_training.filter(ee.Filter.lte('num_route_points',100)), 
//   'num_route_points',
//   64
// ).setOptions({
//     'hAxis': {
//       title: 'Number of Route Points within 500m'
//     },
//     'vAxis': {
//       title: 'Frequency'
//     },
//     histogram: {       
//       maxValue: 100
//     },    'title': 'Training Samples'
//   })
// );

// print(Chart.feature.histogram(
//   tunisia_validation.filter(ee.Filter.lte('num_route_points',100)), 
//   'num_route_points',
//   64
// ).setOptions({
//     'hAxis': {
//       title: 'Number of Route Points within 500m'
//     },
//     'vAxis': {
//       title: 'Frequency'
//     },
//     histogram: {       
//       maxValue: 330
//     },
//     'title': 'Validation Samples'
//   })
// );

// print(tunisia_mobile.size());
// print(Chart.feature.histogram(
//   tunisia_mobile.filter(ee.Filter.lte('num_route_points',100)), 
//   'num_route_points',
//   64
// ).setOptions({
//     'hAxis': {
//       title: 'Number of Route Points within 500m'
//     },
//     'vAxis': {
//       title: 'Frequency'
//     },
//     histogram: {       
//       maxValue: 330
//     },
//     'title': 'Mobile Samples'
//   })
// );

