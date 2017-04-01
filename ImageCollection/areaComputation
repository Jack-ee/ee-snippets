/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("users/teluguntlasaradhi/Australia-1e_200tr_960samples_2year_data_1a_3class"),
    ft = ee.FeatureCollection("ft:1zSJRIWQWYRUapiaaskouFDCN_WbsWETF8RoM5M-r");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// images used for confusion matrix
var hectares = ee.Image.pixelArea().multiply(0.0001)
var australia =  ee.Feature(ft.first());

var crop = image.eq(1).multiply(hectares).select([0],['crop']);
var noncrop = image.eq(3).multiply(hectares).select([0],['noncrop']);
var pasture = image.eq(2).multiply(hectares).select([0],['pasture']);
var merged = crop.addBands(pasture).addBands(noncrop);

var area = merged.reduceRegion({
    reducer: ee.Reducer.sum(), 
    scale: 30, 
    maxPixels: 1e13
    });
    
Export.table.toDrive({
  collection: ee.FeatureCollection([ee.Feature(null, area)])
});
