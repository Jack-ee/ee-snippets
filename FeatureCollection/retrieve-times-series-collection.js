// roi: predefined area
// rnd: random generation
// pts: knowledge, reference
// ana: retrieved mapped values


var ft = {
  afaez8:'19hZjN8dbwPbDHNdLVaoGLEtmIbxAtrn4yDr9QVgt',
  afcountry:'1fGODObRcgWotUauiKV_2GlM7ZXX0sdZ5FLTJeALZ',
  afcropref:'1jlk-V9ml-5Slxt2whiefT8A9iMAyQu52_N-Cn4RM',
  afdivide7:'13VVjyzrfMQG5MswMxztEkT__2Sby-wbUbbjiBi5m',
  afgrid1d:'12RIMwSvyuOJByGe1G_ylgvagH5WzFbxHIXGqCZyB',
  afground:'1FWDClqTift4ljZdWTmo9UVg15ixCJb1EU_VFcheN',
  afgt:'1wiRq9P92gZwR8yCeWCH-X5VNOUV3EjJetQRA9sXH',
  afsimple:'1TGECZQKqqYHfRnveQLMm1c0kloc1xuILAJnOr8CK',
  afvalidset3:'1FWDClqTift4ljZdWTmo9UVg15ixCJb1EU_VFcheN',
  euro500:'1fggoQWHW3c09JEkO2290sMbvVvYSQeUO951gdLVx',
  gtrain:'1C_gFvQmd3AGtB0Q0XgnKk5ESUARSH79FB9Un8sF2',
  sacrop:'1wXVtG63mEE3obsStlLe_DsqrF3KfG-Kq7AofZUNG',
}

var debug = function(arg) { print(arg.limit(5));}//print(arg) }
var ft = ee.FeatureCollection('ft:'+ft.euro500).limit(5)
var start = '2014-01-01', end = '2014-12-31';
var collection = ee.ImageCollection("MODIS/MOD13Q1").select('NDVI').filterDate(start, end);

//// Functions are hoisted to top ////
function getSeries(collection, features, scale, reducer) {
  function renameBands(img) {
    img = ee.Image(img);
    var names = img.bandNames();
    var prefix = ee.String(img.get("system:index")).cat("_");  
    var new_names = names.map(function(b) { return prefix.cat(b); });
    return img.select(names, new_names);
  }

  if (typeof reducer === "undefined") reducer = ee.Reducer.mean();
  if (typeof scale === "undefined") scale = 1000;
  
  var list = collection.toList(1e3).map(renameBands);
  var image = ee.Image(list.slice(1).iterate(function(a, b){return ee.Image(b).addBands(a);}, list.get(0)));
  
  return image.reduceRegions({
      reducer: reducer, // the reducer can also be sum, stddev, etc.
      collection: features,
      scale: scale, // modis pixel size (it rasterizes the vector using that scale)
    });
}

var ret = getSeries(collection, ft);
print(ret)
