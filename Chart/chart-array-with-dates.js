Map.setCenter(31.50398, 31.37196, 14)
var geometry = Map.getCenter()
Map.setOptions('SATELLITE').setControlVisibility(null, null, false, false, false).style().set('cursor', 'crosshair')
var coll = ee.ImageCollection('MODIS/MYD13Q1')
.select('NDVI')
.filterDate('2013-10-01','2014-12-31')

function peak_counting(){
  var arr = coll.toArray()
  
  function tsplot(df, dates){
    var xLabels = dates.map(function(d) { return ee.Date(d).format('MMM')})

    var chart = ui.Chart.array.values(df, 0, xLabels)
    chart.setChartType('LineChart')

    var options = {
      title: 'My title for this chart',
      // hAxis: {slantedTextAngle:90}, 
      // chartArea: {top: 10, bottom: 60}, 
      // legend: 'right',
      lineWidth: 1,
      // pointSize: 3 
    }
    chart.setOptions(options)
    
    print(chart)
  }


  var v1 = arr.arraySlice(0, 0, -4).multiply(0.125)
  var v2 = arr.arraySlice(0, 1, -3).multiply(0.25)
  var v3 = arr.arraySlice(0, 2, -2).multiply(0.25)
  var v4 = arr.arraySlice(0, 3, -1).multiply(0.25)
  var v5 = arr.arraySlice(0, 4).multiply(0.125)
  var filtered = v1.add(v2).add(v3).add(v4).add(v5);
  var f1 = filtered.arraySlice(0, 0, -2);
  var f2 = filtered.arraySlice(0, 1, -1);
  var f3 = filtered.arraySlice(0, 2);
  
  var peaks = f2.gt(f1).and(f2.gt(f3))
  // print(peaks)
  
  var d1 = ee.Array(arr.arraySlice(0, 3, -3).reduceRegion('first', geometry, 1).values().get(0))
  var d2 = ee.Array(filtered.arraySlice(0, 1, -1).reduceRegion('first', geometry, 1).values().get(0))
  var z3 = ee.Image(ee.Array([[0],[0],[0]]))
  
  var dates = coll.getRegion(geometry, 1).slice(4, -3).map(function(f) {
    return ee.Date(ee.List(f).get(3)) 
  })

  // var d3 = ee.Image.cat(z3, peaks, z3)//.toArray(0).multiply(1e4)
  
  var d3 = ee.Array(peaks.reduceRegion('first', geometry, 1).values().get(0)).multiply(8e3)
  
  //   print(d1)
  // print(d3)
  // d3 = ee.Array.cat([ee.Array([0]), d3, ee.Array([0])])

  
  // print(d1)
  // print(d2)
  var df = ee.Array.cat([d1, d2, d3], 1)
  
  print(df)
  tsplot(df, dates)
}

peak_counting()