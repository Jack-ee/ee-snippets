/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-117.72060414458656, 38.844019343111285],
          [-117.67763997801518, 36.03081058160638],
          [-114.24248533914692, 36.04850299669513],
          [-114.19951655810416, 38.84401937858423]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var c = ee.ImageCollection("LC8")
  .filterBounds(geometry)
  .filter(ee.Filter.contains({
      leftValue: geometry, 
      rightField: ".geo"}))

Map.addLayer(c)