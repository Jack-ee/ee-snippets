/***
* Author: Rutger Hofste (rutgerhofste@gmail.com)
*/

// rasterized geometries on PFAF12
var HydroBASINSimage = ee.Image("users/rutgerhofste/PCRGlobWB20V04/support/global_Standard_lev00_30sGDALv01");
var HydroBASINSimageProjection = HydroBASINSimage.projection();
var HydroBASINSimageNominalScale = HydroBASINSimageProjection.nominalScale();

var Levels = {
  "Level 1": 1,
  "Level 2": 2,
  "Level 3": 3,
  "Level 4": 4,
  "Level 5": 5,
  "Level 6": 6,
  "Level 7": 7,
  "Level 8": 8,
  "Level 9": 9,
  "Level 10": 10,
  "Level 11": 11,
  "Level 12": 12,
};

// Create an empty panel in which to arrange widgets.
// The layout is vertical flow by default.
var panel = ui.Panel({style: {width: '400px'}})
    .add(ui.Label('Select HydroBasins Level:'))
    .add(ui.Select({
        items: Object.keys(Levels),
        onChange: function(key) {
          var newBasinPFAFLevel =Levels[key]
          var newHydroBASINimage = HydroBASINSimage.divide(ee.Number(10).pow(ee.Number(12).subtract(newBasinPFAFLevel))).floor();
          Map.addLayer(newHydroBASINimage.randomVisualizer(), {opacity: 1},"HydroBasins", true)
          print("added level: " + Levels[key]);
        }
    })
);

ui.root.add(panel);






