var img = ee.Image("USDA/NASS/CDL/2015").select("cropland")
Map.addLayer(img)

var lookup = ee.Dictionary.fromLists(
    ee.List(img.get('cropland_class_values')).map(ee.String),
    img.get('cropland_class_names')
);

var label = ui.Label({
  value: 'Click to select',
  style: {stretch: 'vertical'}
})
Map.add(ui.Panel().add(label))

Map.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var sampledPoint = img.reduceRegion(ee.Reducer.mean(), point, 30);
  var string = ee.Number(sampledPoint.get("cropland")).format("%d")
  var computedValue = lookup.get(string)

  // Request the value from the server and use the results in a function.
  computedValue.evaluate(function(result) {
    label.setValue("Class: " + result)
  });
});
