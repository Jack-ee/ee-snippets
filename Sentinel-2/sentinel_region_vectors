/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var results = ee.Image("users/JustinPoehnelt/sgmnts_1465420832413_2015_8_01_2016_06_01_100_256_false_100_1800_200_B2B3B4B5B6B7B8B11B12B_NDVI");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var objects = results.select('clusters').reduceToVectors({
  geometry: geometry,
  scale:10,
  tileScale: 4,
  maxPixels: 1e13
});

Export.table.toDrive({
  collection: objects,
  description: "vect_"+exportId,
  folder: 'gee',
  fileNamePrefix: exportId
});

Map.addLayer(objects);