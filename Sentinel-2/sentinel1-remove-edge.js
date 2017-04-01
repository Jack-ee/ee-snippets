/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var sentinel = ee.ImageCollection("COPERNICUS/S2"),
    geometry = /* color: 0B4A8B */ee.Geometry.Polygon(
        [[[6.569652558682719, 35.95494630581348],
          [6.635742188809672, 35.95532843463041],
          [6.635742188809672, 35.97884316805586],
          [6.569652558682719, 35.97880843949329]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var PERIOD_LENGTH = 8,
    START = '2015-07-01', 
    END = '2016-06-01',
    MAX_OBJECT_SIZE = 256,
    THRESHOLD_START = 1,
    THRESHOLD_END = 10,
    THRESHOLD_STEP = 1,
    USE_COSINE = false;

var BAD_SCENES = ['20150627T102531_20160606T223605_T32SKE','20150816T102635_20160309T034718_T32SKE'];

var collection = sentinel
  .filterDate(START,END)
   .map(function(img) {
    // Opaque and cirrus cloud masks cause bits 10 and 11 in QA60 to be set,
    // so values less than 1024 are cloud-free
    var mask = ee.Image(0).where(img.select('QA60').gte(1024), 1).not();
    // var mask = ee.Image(1);
    return img.updateMask(mask);
  })
  // .filterBounds(geometry)
  .map(function(img) {
    img = img.addBands(img.normalizedDifference(['B8', 'B4']).select([0],['B_NDVI']));
    return img;
  })
  .filter(ee.Filter.inList('system:index',BAD_SCENES).not());

// GD: we may try to avoid minified code here
function simpleWindowFilter(e,t,r,a,i){var n=e.select(t).toArray(),s=ee.List(a),m=ee.Number(ee.List(e.aggregate_array("system:index")).map(function(e){return ee.Number.parse(e)}).sort().get(-1)).add(1),u=ee.Image(ee.Array(ee.List.sequence(0,m.subtract(1)).map(function(e){return ee.List.repeat(0,e).cat(s).cat(ee.List.repeat(0,ee.Number(m).subtract(ee.Number(e)["int"]().add(1))))})).slice(1,Math.floor(a.length/2),-1*Math.floor(a.length/2))),d=r.toArray().matrixToDiag();u=u.matrixMultiply(d);var l=u.matrixMultiply(n).divide(u.matrixMultiply(ee.Array(ee.List.repeat([1],m))));if(i)return l;var o=ee.Number.parse(ee.List(e.aggregate_array("system:index")).get(-1));return e=ee.ImageCollection(ee.List.sequence(0,o).map(function(e){var t=l.arraySlice(0,ee.Number(e)["int"](),ee.Number(e).add(1)["int"]()).arrayProject([1]).arrayFlatten([["mean"]]);return t}))}function meanFilter(e,t,r){if(void 0===r)throw"Array based algorithms require consistent number of images in collection.";var a=ee.Number(r),i=e.toArray(),n=ee.List(t),s=ee.Array(ee.List.sequence(0,a.subtract(1)).map(function(e){return ee.List.repeat(0,e).cat(n).cat(ee.List.repeat(0,ee.Number(a).subtract(ee.Number(e)["int"]().add(1))))})).slice(1,Math.floor(t.length/2),-1*Math.floor(t.length/2));s=ee.Image(s);s.matrixMultiply(i).divide(s.matrixMultiply(ee.Array(ee.List.repeat([1],a))));return ee.ImageCollection(ee.List.sequence(0,a.subtract(1)).map(function(e){var t=i.arraySlice(0,ee.Number(e)["int"](),ee.Number(e).add(1)["int"]()).arrayProject([1]).arrayFlatten([["mean"]]);return t}))}function medianFilter(e,t,r,a){if(t>5||1>=t)throw"span not supported in median filter";if(t%2===1&&void 0===a||0>a||a>1)throw"An even span requires requires an explicit adjustment left or right. When running multiple even filters, alternate shift between 0 and 1 to keep data centered";if(void 0===r)throw"Array based algorithms require consistent number of images in collection.";var i=e.toArray(),n=ee.Number(r);t=ee.Number(t);var s=ee.List.sequence(0,n.subtract(1)).map(function(e){e=ee.Number(e).int8();var r=ee.List([e.subtract(t.subtract(1).divide(2)),e.add(t.subtract(1).divide(2))]),s=ee.List([e.subtract(t.divide(2)).add(a),e.add(t.divide(2).subtract(1).add(a))]),m=ee.List(ee.Algorithms.If(e.eq(0),[e,e],s)),u=ee.List(ee.Algorithms.If(e.eq(n.subtract(1)),[e,e],s)),d=ee.List(ee.Algorithms.If(ee.Number(a).eq(0),m,u)),l=ee.List(ee.Algorithms.If(t.mod(2).eq(0),d,r)),o=ee.Number(l.get(0)).min(0).abs().max(ee.Number(l.get(1)).subtract(n.subtract(1)).max(0));l=l.set(0,ee.Number(l.get(0)).add(o).min(n.subtract(1)).int8()).set(1,ee.Number(l.get(1)).subtract(o).min(n.subtract(1)).int8());var c=i.arraySlice(0,ee.Image(ee.Number(l.get(0))),ee.Image(ee.Number(l.get(1)).add(1)));c=c.arraySort();var b=c.arrayLength(0),g=c.arrayGet([b.divide(2).floor().subtract(1).max(0).int8(),0]).add(c.arrayGet([b.divide(2).floor().min(b.subtract(1)).int8(),0])).divide(2),f=c.arrayGet([b.divide(2).floor()["int"](),0]),y=ee.Algorithms.If(t.mod(2).eq(0),g,f);return ee.Image(y).select([0],["median"])["float"]()});return ee.ImageCollection(s)}function smooth4253H(e,t,r){var a=e.select(t),i=(ee.Image(e.first()).bandNames(),ee.Number(ee.List(e.aggregate_array("system:index")).map(function(e){return ee.Number.parse(e)}).sort().get(-1)).add(1)),n=t+"_smooth",s=t+"_rough",m=t+"_combined",u=meanFilter(medianFilter(medianFilter(medianFilter(medianFilter(a.select(t),4,i,0),2,i,1),5,i,0),3,i,0),[.25,.5,.25],i).select(["mean"],[n]);a=a.combine(u);var d=a.map(function(e){return e.select(t).subtract(e.select(n))}),l=meanFilter(medianFilter(medianFilter(medianFilter(medianFilter(d,4,i,0),2,i,1),5,i,0),3,i,0),[.25,.5,.25],i).select(["mean"],[s]);if(a=a.combine(l),a=a.map(function(e){return e.addBands(e.select(s).add(e.select(n)).select([0],[m])).select([t,m],[t,n])}),r){var o=a.select([t,n]).toArray(),c=o.arraySlice(1,0,1);o=o.arraySort(c);var b=o.arrayGet([i.subtract(1),0]).divide(o.arrayGet([i.subtract(1),1]));a=a.map(function(e){return e.addBands(e.select(n).multiply(b).select([0],[n+"_maxAdjust"]))})}return e=e.combine(a,!0)}

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
  var bands = ee.Image(collection.first()).bandNames();
  var defaultValues = ee.List.repeat(ee.Number(0).float(),bands.length()).getInfo();
  var defaultImage = ee.Image(defaultValues).select([".*"], bands);

  collection = ee.ImageCollection(periods.map(function(dt) {
    // Select a subset of the collection based upon the period
    var subset = collection.filterDate(dt, ee.Date(dt).advance(PERIOD_LENGTH, 'day'));
    
    var count = subset.toList(1).length();
    var mean = ee.Image(ee.Algorithms.If(count, subset.mean(), defaultImage));
    
    var condition = 
      mean.mask().reduce(ee.Reducer.min()) // false if any band is masked
      .and(ee.Image(count)) // false if no images 
      .select([0], ['condition']);
      
    var image = defaultImage.where(condition, mean);

    // Save time from period
    image = image.set('system:time_start',ee.Date(dt));
    
    // Add condition band
    image = image.addBands(condition); 
  
    return image;
    
  }));  
  return collection;
}


// mosaic the periods
var periods = getPeriods(START, END, PERIOD_LENGTH);
collection = mosaicCollection(collection.select('B_NDVI'), periods);


///// Interpolate /////
var penalty = collection.select('condition');
var interpolationFilter = [10e1,10e2,10e3,10e8,10e3,10e2,10e1];

// smooth ndvi
var band = 'B_NDVI';
var collection = simpleWindowFilter(collection.select(band), band, penalty, interpolationFilter).select([0], [band + "_interpolated"]);


// convert images to bands
var list = collection.select(band + "_interpolated").toList(100);
var image = ee.Image(list.slice(1).iterate(function(a, b){return ee.Image(b).addBands(a);}, list.get(0)));

Map.addLayer(image.clip(geometry).select([0,10,20]),{},'image');

// var results = ee.Image(ee.List.sequence(THRESHOLD_START,THRESHOLD_END,THRESHOLD_STEP).iterate(function(threshold, image) {
//   threshold = ee.Number(threshold);
//   image = ee.Image(image);
  
//   var imageClustered = ee.apply("Test.Clustering.RegionGrow", {
//     "image": image.select("^(B).*$"),
//     "useCosine": USE_COSINE,
//     secondPass: true,
//     "threshold": threshold,
//     "maxObjectSize": MAX_OBJECT_SIZE,
//   });
  
//   var imageConsistent = ee.apply("Test.Clustering.SpatialConsistency", {
//     "image": imageClustered,
//     "maxObjectSize": MAX_OBJECT_SIZE
//   })
  
//   imageConsistent = ee.apply("Test.Clustering.SpatialConsistency", {
//     "image": imageConsistent,
//     "maxObjectSize": MAX_OBJECT_SIZE
//   })

//   imageConsistent = imageConsistent.select("^(B).*$").addBands(imageConsistent.select('clusters'))
  
//   return ee.Image(ee.Algorithms.If(image.bandNames().contains('clusters'), imageConsistent.addBands(image.select("^(cl).*$")), imageConsistent));
// }, image));

// // Visualize All Levels
// var hierarchy = results.select("^(cl).*$").bandNames().getInfo();
// for (var i = 0; i< hierarchy.length; i++) {
//   Map.addLayer(results.select(hierarchy[i]).randomVisualizer(),{},hierarchy[i],0);
// }

// // Map.addLayer(results.select("^(cl).*$"),{}, 'results',0);

// // Export 
// var exportId = 'sgmnts_' + Date.now().toString();
// Export.image.toAsset({
//   image:results.select("^(cl).*$").int64(), 
//   assetId: exportId,
//   description: exportId,
//   region: geometry,
//   scale:10,
//   maxPixels: 1e13
// });

var exportId2 = 'sentinel_ndvi_image_' + Date.now().toString();
Export.image.toAsset({
  image:image.float(), 
  assetId: exportId2,
  description: exportId2,
  region: geometry,
  scale:10,
  maxPixels: 1e13
});