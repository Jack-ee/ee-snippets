/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var app = {};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Create the UI panels
app.createPanels = function() {};

// GUI
app.intro = {
  panel: ui.Panel([
    ui.Label({
      value: 'NDVI time series generator',
      style: {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
    }),
    ui.Label('Choose your sites by clicking on the map. Then press the button below to generate time series index.')
  ])
};
  
// NDVI button controls
app.buttons = {
  applyNDVIButton: ui.Button({
    label: "Generate NDVI time series data for sites",
    onClick: function() {
      
      // Ensure there are sites set
      if (app.sites) {
        
        app.applyNDVI(); 
        
        // Output to console
        print(app.sites);
        
      } else {
        
        // Output to console
        print('No sites were set.')
      }
    }
  }),
};

// The panel for the widgets
app.buttons.panel = ui.Panel({
  widgets: [
    ui.Panel([
      app.buttons.applyNDVIButton,
    ])
  ]
});



app.applyNDVI = function() {

  var NDVIpts = app.sites
  print(NDVIpts)
  // add explicit coordinates as a property to feature collection
  var NDVIpts2 = NDVIpts.map(function(f) {
    var g = f.geometry().coordinates();
    return f.set('lat', g.get(1),'long', g.get(0));
  });
  
  // Collect data and filter by regions and dates
  var filtered = 
    ee.ImageCollection('LANDSAT/LT5_L1T_32DAY_NDVI')
      .filterDate('1984-10-01', '2013-01-01');
  
  //Create data for table 
  var ndviData = filtered.map(function(img) {
    
    var date = ee.Number(img.get('system:time_start'));
    // Add a band to the nd image representing that number
    img = img.addBands(date).rename(['mean_ndvi', 'date']);
  
    var reduced = img.reduceRegions({
      collection: app.sites,
      reducer: ee.Reducer.mean(),
      scale: 30
    });
  
    return reduced;
  });
  
  Export.table.toDrive(ndviData.flatten(), 'output');
};
 
    
// User selects sites for which NDVI data will be exported
app.applyGetSites = function() {
  
  Map.style().set('cursor', 'crosshair');
  
  Map.onClick(function(coords) {
    
    // if app.sites is undefined - create it
    if (!app.sites) {
      
      app.sites = ee.FeatureCollection(ee.Geometry.Point(coords.lon, coords.lat));
      Map.addLayer(app.sites, {color: "blue"}, 'sites')
      
    // app.sites is defined - new digitized points are added to the layer and displayed
    } else {
      
      app.sites = app.sites.merge(ee.FeatureCollection(ee.Geometry.Point(coords.lon, coords.lat)));
      
      
      print(app.sites)
      // Add a new layer each time the map is clicked
      Map.layers().reset([ui.Map.Layer(app.sites, {color: "blue"}, 'sites')]);
    }
  }); 
};

// App constructor - is run once on startup
app.boot = function() {
  app.createPanels();
  var main = ui.Panel({
    widgets: [
      app.intro.panel,
      app.buttons.panel,
    ],
    style: {width: '320px', padding: '8px'}
  });
  ui.root.insert(0, main);
  app.applyGetSites();
};

app.boot();
