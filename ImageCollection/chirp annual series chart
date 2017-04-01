// Map.setCenter(9.5032, 34.2918, 12)

var d0 = ee.Date('2004-1-1');
var images = ee.List.sequence(0, 10).map(function(i) {
  var start = d0.advance(i, 'year'), end = start.advance(1, 'year')
  return ee.ImageCollection("UCSB-CHG/CHIRPS/PENTAD").filterDate(start, end).sum().set('system:time_start', start)
})

var geometry = /* color: #0B4A8B */ee.Geometry.Polygon(
        [[[30.7177734375, 0.9887204566941844],
          [42.7587890625, 0.39550467153201946],
          [44.40673828125, 10.163560279490476],
          [32.58544921875, 10.962764256386823]]])
Map.centerObject(geometry,8)
var prcpSeries = ui.Chart.image.seriesByRegion({
  imageCollection: ee.ImageCollection.fromImages(images),
  regions: ee.Feature(geometry, {"label": "East Africa"}),
  reducer: ee.Reducer.mean(),
  band: 'precipitation',
  scale: 5e3,
  xProperty: 'system:time_start',
  seriesProperty: 'label'
});

prcpSeries.setOptions({
  title: 'Precipitation over time',
  vAxis: {
    title: 'Precipitation (mm)'
  },
});
print(prcpSeries);