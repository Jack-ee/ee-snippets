//Get images
var l8s = ee.ImageCollection('LC8_L1T_TOA')
          .filterDate(ee.Date.fromYMD(2015,1,1),ee.Date.fromYMD(2015,12,31))
          .select([1,2,3,4,5,9,6],['blue','green','red','nir','swir1','temp','swir2']);
//Add NDVI
l8s = l8s.map(function(img){
  var ndvi = img.normalizedDifference(['nir','red']).rename(['NDVI']);
  return img.addBands(ndvi);
});

//Find pixel values corresonding the the max NDVI
var maxNDVIComposite = l8s.qualityMosaic('NDVI');
Map.addLayer(maxNDVIComposite,{'min': 0.05,'max': [0.3,0.6,0.35],   'bands':'swir1,nir,red'},'Max NDVI Composite');
