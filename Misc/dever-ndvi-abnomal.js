//Denver Water feature collection 
//var denver = ee.FeatureCollection('ft:1-91AaDLysDQXpvxkj3b7PnBpX3KsdvqJ-MJOUmzo');

//All of Denver as one file BUT no DIA
//var denver = ee.FeatureCollection('ft:1zIFvoE6lBQ4VHdgPbIYMvsfs4tpVITQ1oLaosgKU');

//Denver NB Feature Collection Signifcation Normalized NB
//var denver = ee.FeatureCollection('ft:113WzfP6ci7wQK4hFg2KVu9G37Qm2UIKccWCATTdB');


//All of Denver NBs
var denver = ee.FeatureCollection('ft:1IsyGlFrgBzERYEq5qSk0cH1XCfdYnlkXyCL1uA3Z');
//Map.addLayer(denver)

//LANDSAT/LC8_L1T_TOA
//LANDSAT/LT5_L1T_TOA
//LANDSAT/LE7_L1T_TOA


// Load a landsat collection and filter by path, row, and date
//Metadata filter to exclude images with cloudcover over 30%
//3000meter buffer applied to remove jagged landsat image edges
 var collection = ee.ImageCollection('LANDSAT/LT5_L1T_TOA')
  .filterDate('2006-01-01', '2006-12-31')
  .filterMetadata('CLOUD_COVER','less_than',30)
  .filterBounds(denver.geometry().bounds())
  .map(function (img) {
         return img.clip(img.geometry().buffer(-3000))
  });

//function to create mask from cloud score 
var maskClouds = function(image) {
  var score = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  return image.updateMask(score.lte(30));
};

//apply function to create masks
var maskedImages = collection.map(maskClouds);

//----- List number of images used to create mosaic
var imagesize = maskedImages.toList(100).length();
print('Number of images: ', imagesize);

//Get NDVI from Landsat 5 Imagedry and create fucntion
var addNDVI = function(image) {
  return image.addBands(image.normalizedDifference(['B4', 'B3']).rename('ndvi'));
};

// function to add system time band
var addTimeBand = function(image) {
  return image.addBands(image.select('system:time_start').rename("time"))
};

//add time and ndvi to masked images
var l5toaNDVI = maskedImages.map(addNDVI);
var l5toaNDVI2 = maskedImages.map(addTimeBand);

//apply mask to NDVI values of 1 that were not eliminated from buffer
//var mask_zeros = function(image) {
//  return image.mask(image.select('ndvi').neq(1));
//  };

var noNDVI1 = l5toaNDVI;//.map(mask_zeros)
//Map.addLayer(noNDVI1)


//Create composite based off max NDVI values, each pixel contains maximum NDVI from picture collection
var l5max = noNDVI1.qualityMosaic('ndvi').select('ndvi').clip(denver);


//Create Median Pixel Composite
//var NDVI = maskedImages.map(addNDVI);
//var medNDVI= NDVI.median()
//var clipdenver= medNDVI.clip(denver)


//masking water values so they are transparent. Values with a NDVI value less than zero will be rendered transparent. 
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2013');
var data = hansenImage.select('datamask');
var mask1 = data.eq(1);

var maskndvi = l5max.mask(mask1);
var landndvi= maskndvi.clip(denver);

Map.addLayer(landndvi)

///////////////////////////////Printing Max NDVI Values with Dates///////////////////////

var getMeans = function(image) {
  return denver.map(function(feature) {
    var dict = image.reduceRegion({
      geometry: feature.geometry(),
      reducer: ee.Reducer.max(),
      scale: 30,
      bestEffort: true,
      maxPixels: 1e6,
    })
    return ee.Feature(null, {
        name: feature.get('NBHD_NAME'),
        max: dict.get('ndvi'),
        date: image.get('DATE_ACQUIRED')});
  })
}

//flatten takes all seperate features (e.g. NBHD_NAME and NDVI and combines them from seperate lists to the same list)
var results = l5toaNDVI.map(getMeans).flatten();
Map.addLayer(l5toaNDVI)

//----- Filter out 'null' values 
var filtered_results3 = results.filterMetadata('mean', 'not_equals', null);

var filenamePrefix3 = 'Maximum_NDVI_Dated_1984';

var taskParams3 = {
  'driveFolder' : 'NDVI_Trials',
  'fileFormat' : 'CSV'
};
  
Export.table(results, filenamePrefix3, taskParams3);



///////////////////////////////Landsat 8///////////////////////////////////////

// Load a landsat collection and filter by path, row, and date
var collection_1 = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
  .filterDate('2013-05-01','2013-09-30')
  .filterBounds(denver.geometry().bounds());
 
//function to create mask from cloud score
var maskClouds = function(image) {
  var score = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  return image.updateMask(score.lte(30));
};

//apply function to create masks
var maskedImages_1 = collection_1.map(maskClouds);


//Get NDVI from Landsat 5 Imagedry 
var addNDVI = function(image) {
  return image.addBands(image.normalizedDifference(['B5', 'B4']).rename('ndvi'));
};

var NDVI_1 = maskedImages_1.map(addNDVI);
var medNDVI_1= NDVI_1.max()
var clipdenver_1= medNDVI_1.clip(denver)


//masking water values so they are transparent. Values with a NDVI value less than zero will be rendered transparent. 
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2013');
var data = hansenImage.select('datamask');
var mask = data.eq(1);

var maskndvi_1 = clipdenver_1.mask(mask);
var landndvi_1= maskndvi_1.clip(denver);

//Map.addLayer(landndvi_1)


//////////////////////////////PRINTING INFOMRATION//////////////////////////////////////

//////////////////////////////PRINTING METADATA////////////////////////////////////////
var fc = ee.FeatureCollection(l5toaNDVI).select([
  'system:index',
  'DATE_ACQUIRED',
  'system:time_start',
  'CLOUD_COVER',
]);

var filenamePrefix2 = 'Metadata_1984';

var taskParams2 = {
  'driveFolder' : 'NDVI_Trials',
  'fileFormat' : 'CSV'
};
  
Export.table(fc, filenamePrefix2, taskParams2);


//////////////////////Print information from LS5 or LS7 (NOT LS 8)////////////////////
//PRINT CSV WITH JUST VALUES 

var ndvicalc2010 = denver.map(function(feature) {
  var ndvimean = landndvi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30,
    maxPixels: 1e9
    });
  var ndvimax = landndvi.reduceRegion({
    reducer: ee.Reducer.max(),
    geometry: feature.geometry(),
    scale: 30,
    maxPixels: 1e9
    });
        return ee.Feature(null, {
        name: feature.get('NBHD_NAME'),
        mean: ndvimean.get('ndvi'),
        max: ndvimax.get('ndvi'),
        datemax: l5toaNDVI.get('DATE_ACQUIRED')});
 // return feature.set({'ndviyear2010': ndviyear2010});
});


print(ndvicalc2010)


//var date = ndvicalcmax.limit(2).toList(2).map(
//  function(date) { return ee.Image(date).get('date_aquired'); });
//print(date);

var filenamePrefix1 = 'MaxComposite_MaxNDVI_MeanNDVI_1984';

var taskParams1 = {
  'driveFolder' : 'NDVI_Trials',
  'fileFormat' : 'CSV'
};
  
Export.table(ndvicalc2010, filenamePrefix1, taskParams1);



///////////////////////////////////////////HISTOGRAM////////////////////////////////////

var ndvihist=
  Chart.image.histogram(landndvi,denver,10);
ndvihist= ndvihist.setOptions({
  bucketSize:0.02,
  maxNumBuckets:50,
  minValue:0,
  maxValue: 1,
  title:'Histogram of NDVI Values:2003'
});

print(ndvihist);




