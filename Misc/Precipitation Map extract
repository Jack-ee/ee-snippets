//////////////
//This code will extract CHIRPS precipitation data for a set of localities
/////////////

//Create a KML file of your localities using ArcMap or QGIS
//NB: in the attributes table create a column called 'name' to house your point IDs/names
//Create a fusion table that looks like this one: https://fusiontables.google.com/data?docid=1SAODI5IfoiNnn6taWI1Qco4_5ZmlVME2wotvHcCd#rows:id=1
//Click on 'File' and then 'About this table' and copy the table ID into the line of code below
var geometry = ee.FeatureCollection('ft:1SAODI5IfoiNnn6taWI1Qco4_5ZmlVME2wotvHcCd');

//////////////////////////////////////////////////////////////////////////
//Code to aggregate to monthly averages
var temporalAverage = function(collection, unit) {
  // function temporalAverage(collection, unit)
  // makes a new image collection with temporal averages of images
  // in input. The period of each time segment is given by 'unit' and can be
  // one of 'year', 'month', 'week' or 'day'. The temporal extent 
  // matches that of the input 'collection'
  //
  // NOTE: user must be careful not to exceed aggregation quota

  var startDate = ee.Date(ee.Image(collection.sort('system:time_start').first()).get('system:time_start'));
  startDate = startDate.advance(ee.Number(0).subtract(startDate.getRelative('month',unit)),'month')
    .update(null,null,null,0,0,0);

  var endDate = ee.Date(ee.Image(collection.sort('system:time_start',false).first()).get('system:time_start'));
  endDate = endDate.advance(ee.Number(0).subtract(endDate.getRelative('month',unit)),'month')
    .advance(1,unit).advance(-1,'month')
    .update(null,null,null,23,59,59);

  var dateRanges = ee.List.sequence(0, endDate.difference(startDate,unit).round().subtract(1))

  function makeTimeslice(num) {
    var start = startDate.advance(num, unit);
    var end = start.advance(1, unit).advance(-1, 'second');
    // Filter to the date range
    var filtered = collection.filterDate(start, end);
    // Get the mean
    var unitMeans = filtered.mean()
      .set('system:time_start',start,'system:time_end',end);
    return unitMeans;
  }
  // Aggregate to each timeslice
  var new_collection = ee.ImageCollection(dateRanges.map(makeTimeslice));

  return new_collection;
};

//////////////////////////////////////////////////////////////////////////
// Load the CHIRPS data, filter by location and date. See this link for details:
//https://explorer.earthengine.google.com/#detail/UCSB-CHG%2FCHIRPS%2FPENTAD
var collection = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterBounds(geometry)
  .filterDate('2000-01-01', '2001-01-10')
  ;
//Print the collection to explore its content
print(collection);
//Create and print the aggregated collection
var collectionAg = temporalAverage(collection, 'month');
print(temporalAverage(collectionAg,'month'));

//Set visualization parameters for the adding it to eh map console below
var PPT_PALETTE = ('F5F5DC, D2B48C, 40E0D0, 80FF00, 006400, 0000FF');
var vizParams = {'forceRgbOutput':true, 
  bands: ['precipitation'],
  min: 0, max: 60, 
  palette: PPT_PALETTE, 
  opacity: 0.8
};
//Add the mean of the collection
Map.addLayer(collectionAg, vizParams, 'precip_mean');
Map.centerObject(geometry, 5);//centers and sets zoom

//Add the sampling points to the map in red    
Map.addLayer(geometry, {color: "FF0000"}, 'samping points');


//////////////////////////////////////////////////////////////////////////
//Attempt to create a table with the aggregated precip values and dates
var table = ee.FeatureCollection(collectionAg).select([
  'system:time_start',
  'precipitation'
]);

print(table);

// Drop nulls and discard the description column.
table = table.filter(ee.Filter.neq('precipitation', null)).select(['precipitation', 'date']);

//Print first row and export CSV to drive
print(table.first());
Export.table(table, "Precipitation", {fileFormat: "CSV", driveFileNamePrefix: "Precipitation"});

