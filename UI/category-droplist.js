// Select images from a collection with a silder.
Map.setOptions('SATELLITE').setControlVisibility(false, null, false, false, false).style().set('cursor', 'crosshair')
var collection = ee.ImageCollection('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS')
    .select('stable_lights')

// A helper function to show the image for a given year on the default map.
var showLayer = function(year) {
  Map.layers().reset();
  var date = ee.Date.fromYMD(year, 1, 1);
  var dateRange = ee.DateRange(date, date.advance(1, 'year'));
  var image = collection.filterDate(dateRange).first();
  Map.addLayer({
    eeObject: ee.Image(image),
    visParams: {
      min: 0,
      max: 63,
      palette:['000000', 'FFFF00', 'FFA500', 'FF4500', 'FF0000']
    },
    name: String(year)
  });
};

var slider = ui.Slider({
  min: 1992,
  max: 2007,
  step: 1,
  onChange: showLayer,
  style: {stretch: 'horizontal'}
});

function redraw(){
  // ui.Select

}

function sa_f1(){print('sa_f1')}
function sa_f2(){print('sa_f2')}
function sa_f3(){print('sa_f3')}
function sa_f4(){print('sa_f4')}
var clicks = [sa_f1, sa_f2, sa_f3, sa_f4]

function makelevel2(){
  // regions
  print(regions.indexOf(select.getValue()));
  var choice = regions.indexOf(select.getValue())
  clicks[choice]()
  // print(1)
  var level2items = ['New','Corn','Sugarcane','All Crop']
  var level2 = ui.Select({items: level2items, value: level2items[0], onChange: redraw})
  panel.widgets().set(3, level2)
}


var regions = 'Africa.Northern Africa.Ethiopia.South Africa'.split('.')
var select = ui.Select(regions, 'select a region', regions[0], makelevel2);
var level2items = ['Corn','Sugarcane','All Crop']
var level2 = ui.Select({items: level2items, value: level2items[0], onChange: redraw})


var panel = ui.Panel({
  widgets: [
    ui.Label({
      value: 'GFSAD30 Crop Type Map',
      style: {fontSize: '16px', fontWeight: 'bold'}
    }),
    ui.Label('Select a region to inspect'),
    select
  ],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    position: 'top-right',
    padding: '0px'
  }
});
Map.add(panel);
Map.setCenter(30, 45, 4);