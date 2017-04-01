/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var referenceData = ee.FeatureCollection("ft:1C_gFvQmd3AGtB0Q0XgnKk5ESUARSH79FB9Un8sF2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Script: Subset Training Data

Author: Justin Poehnelt 
Date:   2016-1-27

*/


/**
 * Randomly split a feature collection.
 * @param {FeatureCollection} fc 
 * @param {Float} percentage
 * @return {List} first element contains the subset requested, second is the remainder
 */
function subsetFeatureCollection(fc, percentage) {
  fc = fc.randomColumn('random');
  return [
    fc.filter(ee.Filter.lte('random', percentage)),
    fc.filter(ee.Filter.gt('random', percentage))
  ];
}


// easy to create a subset of 10%
var subset = subsetFeatureCollection(referenceData, 0.05);
var trainging_assessment = subset[0];
var training = subset[1];

// add to map
Map.addLayer(training, {color: '00FF00'}, 'training subset');
Map.addLayer(trainging_assessment, {color: 'FF0000'}, 'trainging assessment subset');
