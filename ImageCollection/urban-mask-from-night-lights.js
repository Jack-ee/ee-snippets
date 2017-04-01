/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var nightLights = ee.ImageCollection("NOAA/DMSP-OLS/NIGHTTIME_LIGHTS"),
    ndvi = ee.ImageCollection("LANDSAT/LC8_L1T_ANNUAL_NDVI");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var urban_mask = ndvi.max().lt(0.3).and(nightLights.select("stable_lights").mean().gt(10)).select([0], ['urban_mask']);

Map.addLayer(urban_mask);