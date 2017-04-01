/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("users/JustinPoehnelt/sgmnts_1469561047524_2015_8_01_2016_04_01_150_256_false_100_1200_100_B2B3B4B5B6B7B8B11B12B_NDVI");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Visualize All Levels
var hierarchy = image.select("^(cl).*$").bandNames().getInfo();
for (var i = 0; i< hierarchy.length; i++) {
  Map.addLayer(image.select(hierarchy[i]).randomVisualizer(),{},hierarchy[i],0);
}
Map.centerObject(image);

Map.addLayer(image.select('clusters').focal_mode({iterations: 2, radius:3, kernelType: 'cross'}).randomVisualizer())
