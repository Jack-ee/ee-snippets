// Settings
var STATENAME = 'California' ;
var CROPYEAR = 2015 ;
var CROPNUMBER =  0 ; //use CDLcropland_class_values and CDLcropland_class_names
var SCALE = 30 ; //Calculation is at 30m resolution 

// Load states of the US
var statesCollection = ee.FeatureCollection('ft:1fRY18cjsHzDgGiJiS2nnpUU3v9JPDc2HNaR7Xk8');
var stateCollection  = statesCollection.filterMetadata('Name', 'equals', STATENAME);
var state = ee.Feature(stateCollection.first());

// import crop layer
var CDLCollection = ee.ImageCollection('USDA/NASS/CDL');
var filterYear = ee.Filter.calendarRange(CROPYEAR,CROPYEAR,'year');
var CDLImage = ee.Image(CDLCollection
.filter(filterYear)
.select('cropland')
.first());

var CDLPropertyNames = CDLImage.propertyNames();
var CDLcropland_class_values = ee.List(CDLImage.get("cropland_class_values"));
var CDLcropland_class_names = ee.List(CDLImage.get("cropland_class_names"));
var CDLcropland_class_palettes = ee.List(CDLImage.get("cropland_class_palette"));

var  CDLcropland_class_value = ee.Number(CDLcropland_class_values.get(CROPNUMBER));
var  CDLcropland_class_name = ee.String(CDLcropland_class_names.get(CROPNUMBER));
var  CDLcropland_class_palette = ee.String(CDLcropland_class_palettes.get(CROPNUMBER));
print(CDLcropland_class_value,CDLcropland_class_name,CDLcropland_class_palette)

// ---------  PROBLEM:  --------
// CDLcropland_class_name and CDLcropland_class_palette still seem to be objects and not strings. Print works but I can't use the values in  
// -----------------------------


var cropImage = CDLImage.eq(CDLcropland_class_value); 


// calculate percentage crop
var meanCrop = cropImage.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: state.geometry(),
  scale: SCALE,
  maxPixels: 1e9
});


var cropImageVisParam = {"opacity":1,"bands":["cropland"],"palette":["000000","ff0000"]};
var cropImageMasked = cropImage.updateMask(cropImage.eq(1));

Map.addLayer(state, {}, STATENAME,1,0.5);
Map.addLayer(cropImage,cropImageVisParam,'This is working',0,1);


// get map layers collection
var layers = Map.layers()

// create a new layer and remember it
var layer = ui.Map.Layer(cropImageMasked,cropImageVisParam,'loading ...', 1, 1)

// add layer
layers.add(layer)

// update layer name 
function updateLayerName(name) {
  layer.setName(name)
}

// force getInfo(), asynchroneous call
CDLcropland_class_name.getInfo(updateLayerName)


