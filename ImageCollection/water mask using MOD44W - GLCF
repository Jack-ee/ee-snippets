/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var mod44w = ee.Image("MODIS/MOD44W/MOD44W_005_2000_02_24"),
    inland = ee.ImageCollection("GLCF/GLS_WATER"),
    ndvi = ee.ImageCollection("LANDSAT/LC8_L1T_ANNUAL_NDVI"),
    ndvi_32 = ee.ImageCollection("LANDSAT/LC8_L1T_32DAY_NDVI");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// build a water mask
var water = inland.mode().eq(2);
var water_refined = water.and(ndvi_32.max().lt(0.20)); // make sure no water has a high ndvi
// Map.addLayer(water.subtract(water_refined), {min:0, max:1}, 'refined diff');

// // get an image to mask
// var ndvi = ndvi.filterDate("2014-01-01","2014-12-31")
//                 .mean()
//                 .updateMask(water.eq(0));

// Map.addLayer(water, {min:0, max:1}, 'water');
// Map.addLayer(water_refined, {min:0, max:1}, 'water_refined');
// Map.addLayer(ndvi, { 'palette':'FFFFFF, CE7E45, DF923D, F1B555, FCD163, 99B718, 74A901, 66A000, 529400,' +
//     '3E8601, 207401, 056201, 004C00, 023B01, 012E01, 011D01, 011301' }, 'ndvi_water_masked');

Map.addLayer(water.focal_mean({radius: 30, iterations: 10}),{min:0, max:1, palette:'000000,0000ff'})