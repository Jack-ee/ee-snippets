/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var region = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-122.607421875, 43.447934055374034],
          [-122.16796875, 44.835421613637564],
          [-123.486328125, 44.52294742992487]]]),
    line = /* color: #98ff00 */ee.Geometry.LineString(
        [[-120.05859375, 44.648139323193966],
         [-124.27734375, 43.766135280960974]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var startDate = '2005-06-01';
var endDate = '2005-09-30';

// Get collection
var c = ee.ImageCollection('LANDSAT/LT5_L1T_TOA')
      .filterDate(startDate,endDate)
      .filterBounds(region)
      
// Create a median mosaic from the collection
// *Not* the best way to do this, but just for simplicity
var medImage = c.median();

// Calculate NDVI
var ndvi = medImage.normalizedDifference(['B4', 'B3']);

// Create a list of distances
var distances = ee.List.sequence(1000, 5000, 1000);

// Map over these distances and return mean values
var means = distances.map(function(d) {
  var b = line.buffer(d);
  var m = ndvi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: b,
    scale: 30,
    maxPixels: 1e9
  });
  return m.get('nd');
});

// Graph the NDVI values across buffer widths
var chart = ui.Chart.array.values(means, 0, distances)
  .setChartType('ColumnChart');
print(chart);
