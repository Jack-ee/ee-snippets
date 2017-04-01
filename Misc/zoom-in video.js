/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-122.54837036132812, 37.73352554959531],
          [-122.35576629638672, 37.73298250331026],
          [-122.3550796508789, 37.819276821747295],
          [-122.5469970703125, 37.819276821747295]]]),
    geometry2 = /* color: #98ff00 */ee.Geometry.MultiPoint();
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var image = ee.Image('UMD/hansen/global_forest_change_2015').resample()
  .visualize({bands:['treecover2000'], min:0, max:100, palette:['000000', '008000']});

var center = geometry.centroid().coordinates();
var dst_proj = ee.Projection('EPSG:4326', [1, 0, center.get(0), 0, 1, center.get(1)]);

var images = ee.ImageCollection(ee.List.sequence(100, 0, -1).map(function (i) {
  var scale = ee.Number(2).pow(ee.Number(i).divide(10));
  var src_proj = dst_proj.scale(scale, scale);
  return image.changeProj(src_proj, dst_proj);
}));

Export.video.toCloudStorage({
  collection: images,
  description: 'VideoZoomTest',
  bucket: 'mdh-test',
  fileNamePrefix: 'VideoZoomTest',
  framesPerSecond: 10,
  dimensions: 1000,
  region: geometry,
});
