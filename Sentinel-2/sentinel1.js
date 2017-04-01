/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi = /* color: #d63000 */ee.Geometry.Polygon(
        [[[104.39967317142975, 8.648797299726574],
          [104.97136816724105, 8.42750154669911],
          [105.44386722890897, 8.433739470974832],
          [106.66892316475673, 9.522314436594979],
          [107.25187226402818, 10.336446225915548],
          [106.80624398899499, 11.138468981755926],
          [104.38860737239793, 10.944315053122876]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Load the Sentinel-1 ImageCollection.
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD');

// Filter VH, IW
var vh = sentinel1
  // Filter to get images with VV and VH dual polarization.
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  // reduce to VH polarization
  .select('VH')
  // filter 10m resolution
  .filter(ee.Filter.eq('resolution_meters', 10));
// Filter to orbitdirection Descending
var vhDescending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
// Filter time 2015
var vhDesc2015 = vhDescending.filterDate(ee.Date('2015-01-01'), ee.Date('2015-12-31'));

//The image collection spans the globe, or at least the parts that Sentinel-1 regularly covers. 
// I am only interested in the Mekong Delta for now, so I’ll clip the image collection with a polygon 
// of my Region-of-Interest

//
var roi2 = ee.Geometry.Polygon(
        [[[-74.39967317142975, 2.648797299726574],
          [-74.97136816724105, 2.42750154669911],
          [-73.44386722890897, 2.433739470974832],
          [-72.66892316475673, 9.522314436594979],
          [-71.25187226402818, 10.336446225915548],
          [-72.80624398899499, 11.138468981755926],
          [-74.38860737239793, 10.944315053122876]]]);
// Filter to MKD roi
var s1_mkd = vhDesc2015.filterBounds(roi);

var s2_mkd = vhDesc2015.filterBounds(roi2);


var p90 = s1_mkd.reduce(ee.Reducer.percentile([90]));
var p10 = s1_mkd.reduce(ee.Reducer.percentile([10]));
var s1_mkd_perc_diff = p90.subtract(p10);

var p90n = s2_mkd.reduce(ee.Reducer.percentile([90]));
var p10n = s2_mkd.reduce(ee.Reducer.percentile([10]));
var s2_mkd_perc_diff = p90n.subtract(p10n);


//This type of calculation of features over a time-series is blazingly fast 
//and it only takes seconds to visualize the results for this. 
//Areas with a high amplitude are bright and areas with low amplitude are dark. 
//Near the city of Rach Gia we can already see some structures from this amplitude image. 
//Some (presumeably) forest and urban areas in dark color, some very bright areas, 
//which might be rice fields or other agriculture.

Map.addLayer(s1_mkd_perc_diff, {min: [2], max: [17]}, 'p90-p10 2015', 1);

Map.addLayer(s2_mkd_perc_diff, {min: [2], max: [17]}, 'p90-p10 2015', 1);

//Following the initial idea, that agriculture has a higher backscatter amplitude 
//than other land cover, I’ll mask all areas with a backscatter amplitude larger than 7.5 dB.
var amplitude_mask = s1_mkd_perc_diff.gt(7.5);
var amplitude_mask = amplitude_mask.updateMask(amplitude_mask);
Map.addLayer(amplitude_mask, {palette: 'FF0000'}, 'amplitude_mask', 1);

var amplitude_mask2 = s2_mkd_perc_diff.gt(7.5);
var amplitude_mask2 = amplitude_mask.updateMask(amplitude_mask);
Map.addLayer(amplitude_mask2, {palette: 'FF0000'}, 'amplitude_mask', 1);