// Create a feature collection from a Fusion Table.
//
// Select "desert" features from the TNC Ecoregions fusion table.
var fc = ee.FeatureCollection('ft:1Ec8IWsP8asxN-ywSqgXWMuBaxI6pPaeh6hC64lA')
  // .filter(ee.Filter.contains('ECO_NAME', 'desert'));

// Paint into a blank image.  Cast to byte() so we can use more than 1 color.
var image1 = ee.Image()
               .byte()
               .paint(fc, 'ECO_NUM');
// Display the image using random colors for each value.
Map.addLayer(image1.randomVisualizer());

Map.setCenter(-93, 40, 4);
