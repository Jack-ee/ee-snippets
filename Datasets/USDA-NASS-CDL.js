/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var cdl = ee.ImageCollection("USDA/NASS/CDL");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
print(cdl)
print(cdl.aggregate_array('system:index'))