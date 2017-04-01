

// A UI to interactively filter a collection, select an individual image
// from the results, display it with a variety of visualizations, and export it.

// The namespace for our application.  All the state is kept in here.
var app = {};

/** Creates the UI panels. */
app.createPanels = function() {
  /* The introduction section. */
  app.intro = {
    panel: ui.Panel([
      ui.Label({
        value: 'Sentinel Explorer',
        style: {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
      }),
      ui.Label('This app allows you to filter and export images ' +
               'from the Sentinel 2 collection.')
    ])
  };

  /* The collection filter controls. */
  app.filters = {
    mapCenter: ui.Checkbox({label: 'Filter to map center', value: true}),
    startDate: ui.Textbox('YYYY-MM-DD', '2015-06-23'),
    endDate: ui.Textbox('YYYY-MM-DD', '2017-01-01'),
    applyButton: ui.Button('Apply filters', app.applyFilters),
    loadingLabel: ui.Label({
      value: 'Loading...',
      style: {stretch: 'vertical', color: 'gray', shown: false}
    })
  };

  /* The panel for the filter control widgets. */
  app.filters.panel = ui.Panel({
    widgets: [ 
      ui.Label('1) Filter date', {fontWeight: 'bold'}),
      ui.Label('Start date', app.HELP_TEXT_STYLE), app.filters.startDate,
      ui.Label('End date', app.HELP_TEXT_STYLE), app.filters.endDate,
      app.filters.mapCenter,
      ui.Panel([
        app.filters.applyButton,
        app.filters.loadingLabel
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });

  /* The image picker section. */
  app.picker = {
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      placeholder: 'Select an image ID',
      onChange: app.refreshMapLayer
    }),
    // Create a button that centers the map on a given object.
    centerButton: ui.Button('Center on map', function() {
      Map.centerObject(Map.layers().get(0).get('eeObject'));
    })
  };

  /* The panel for the picker section with corresponding widgets. */
  app.picker.panel = ui.Panel({
    widgets: [
      ui.Label('2) Select an image', {fontWeight: 'bold'}),
      ui.Panel([
        app.picker.select,
        app.picker.centerButton
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });

  /* The visualization section. */
  app.vis = {
    label: ui.Label(),
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      items: Object.keys(app.VIS_OPTIONS),
      onChange: function() {
        // Update the label's value with the select's description.
        var option = app.VIS_OPTIONS[app.vis.select.getValue()];
        app.vis.label.setValue(option.description);
        // Refresh the map layer.
        app.refreshMapLayer();
      }
    })
  };
  
  /* The panel for the visualization section with corresponding widgets. */
  app.vis.panel = ui.Panel({
    widgets: [
      ui.Label('3) Select a visualization', {fontWeight: 'bold'}),
      app.vis.select,
      app.vis.label
    ],
    style: app.SECTION_STYLE
  });

  // Default the select to the first value.
  app.vis.select.setValue(app.vis.select.items().get(0));

  /* The export section. */
  app.export = {
    button: ui.Button({
      label: 'Export the current image to Drive',
      // React to the button's click event.
      onClick: function() {
        // Select the full image id.
        var imageIdTrailer = app.picker.select.getValue();
        var imageId = app.COLLECTION_ID + '/' + imageIdTrailer;
        // Get the visualization options.
        var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
        // Export the image to Drive.
        Export.image.toDrive({
          image: ee.Image(imageId).select(visOption.visParams.bands),
          description: 'S2_Export-' + imageIdTrailer,
        });
      }
    })
  };

  /* The panel for the export section with corresponding widgets. */
  app.export.panel = ui.Panel({
    widgets: [
      ui.Label('4) Start an export', {fontWeight: 'bold'}),
      app.export.button
    ],
    style: app.SECTION_STYLE
  });
};

/** Creates the app helper functions. */
app.createHelpers = function() {
  /**
   * Enables or disables loading mode.
   * @param {boolean} enabled Whether loading mode is enabled.
   */
  app.setLoadingMode = function(enabled) {
    // Set the loading label visibility to the enabled mode.
    app.filters.loadingLabel.style().set('shown', enabled);
    // Set each of the widgets to the given enabled mode.
    var loadDependentWidgets = [
      app.vis.select,
      app.filters.startDate,
      app.filters.endDate,
      app.filters.applyButton,
      app.filters.mapCenter,
      app.picker.select,
      app.picker.centerButton,
      app.export.button
    ];
    loadDependentWidgets.forEach(function(widget) {
      widget.setDisabled(enabled);
    });
  };

  /** Applies the selection filters currently selected in the UI. */
  app.applyFilters = function() {
    app.setLoadingMode(true);
    var filtered = ee.ImageCollection(app.COLLECTION_ID);

    // Filter bounds to the map if the checkbox is marked.
    if (app.filters.mapCenter.getValue()) {
      filtered = filtered.filterBounds(Map.getCenter());
    }
      

    // Set filter variables.
    var start = app.filters.startDate.getValue();
    if (start) start = ee.Date(start);
    var end = app.filters.endDate.getValue();
    if (end) end = ee.Date(end);
    if (start) filtered = filtered.filterDate(start, end);
    app.ImageCollection_filtered = filtered
    // Get the list of computed ids.
    var computedIds = filtered
        .limit(app.IMAGE_COUNT_LIMIT)
        .reduceColumns(ee.Reducer.toList(), ['system:index'])
        .get('list');

    computedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.select.items().reset(ids);
      // Default the image picker to the first id.
     app.picker.select.setValue(app.picker.select.items().get(0));
   
    });
  };
 
  /** Refreshes the current map layer based on the UI widget states. */
  app.refreshMapLayer = function() {
    
    Map.clear();
    var imageId = app.picker.select.getValue();
    if (imageId) {
      // If an image id is found, create an image.
      var image = ee.Image(app.COLLECTION_ID + '/' + imageId);
  
      var layer;

      if (app.vis.select.getValue() === 'NDVI (B8-B4/B8+B4)') {
        layer = s2ndvi(image);
      } else {
        layer = image;
      }
      var layer2;

      if (app.vis.select.getValue() === 'NDWI (B3-B8/B3+B8)') {
        layer = s2ndwi(image);
      } else {
        layer2 = image;
      }
       
      // Add the image to the map with the corresponding visualization options.
      var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
      Map.addLayer(layer, visOption.visParams, imageId);
    ///NDVI and NDWI ADD BANDS to image


      /////////////// Create chart ///////////////
      // Create a panel to hold our widgets.
      var panel2 = ui.Panel();
      panel2.style().set('width', '300px');
      
      // Create an intro panel with labels.
      var intro2 = ui.Panel([
        ui.Label({
          value: 'Chart Inspector',
          style: {fontSize: '20px', fontWeight: 'bold'}
        }),
        ui.Label('Click a point on the map to inspect.')
      ]);
      panel2.clear();
      panel2.add(intro2);
      
      // Create panels to hold lon/lat values.
      var lon = ui.Label();
      var lat = ui.Label();
      panel2.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));
      
      // Register a callback on the default map to be invoked when the map is clicked.
      Map.onClick(function(coords) {
        // Update the lon/lat panel with values from the click event.
        lon.setValue('lon: ' + coords.lon.toFixed(2)),
        lat.setValue('lat: ' + coords.lat.toFixed(2));
      
        // Add a red dot for the point clicked on.
        var point = ee.Geometry.Point(coords.lon, coords.lat);
        var dot = ui.Map.Layer(point, {color: 'FF0000'});
        Map.layers().set(1, dot);
      
        // Create an Band spectrum chart.
        var bandsChart = ui.Chart.image.series(app.ImageCollection_filtered.select('B8', 'B4', 'B3'), point)
            .setOptions({
              title: 'bands Reflectance Over Time',
              vAxis: {title: 'Bands value'},
              hAxis: {title: 'Date', format: 'dd-MM-yy', gridlines: {count: 7}},
            });
         panel2.widgets().set(2, bandsChart);
         
        
        var ndviChart = ui.Chart.image.series({
          imageCollection: app.ImageCollection_filtered.map(function(img) {
            return img.normalizedDifference(['B8', 'B4'])
                      .rename('NDVI')
                      .copyProperties(img, ['system:time_start']);
          }), 
          region: point
        }).setOptions({
              title: 'NDVI Over Time',
              vAxis: {title: 'ndvi (nd)'},
              hAxis: {title: 'Date', format: 'dd-MM-yy', gridlines: {count: 7}},
            });
        panel2.widgets().set(3, ndviChart);
      });
      
      Map.style().set('cursor', 'crosshair');
      ui.root.widgets().set(2, panel2);
    }
  };
};     
////////////////////////////////////////
                 
function s2ndvi(image){
  var ndvi = image.normalizedDifference(['B8', 'B4']);
  return image.addBands(ndvi);
}
function s2ndwi(image){
  var ndwi = image.normalizedDifference(['B3', 'B8']);
  return image.addBands(ndwi);
}
var palette = [ 'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
               '74A901', '66A000', '529400', '3E8601', '207401', '056201',
               '004C00', '023B01', '012E01', '011D01', '011301'];
var palette2 = [ '0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff'];

 
/** Creates the app constants. */
app.createConstants = function() {
  app.ImageCollection_filtered = ee.ImageCollection('COPERNICUS/S2');
  app.COLLECTION_ID = 'COPERNICUS/S2';
  app.SECTION_STYLE = {margin: '20px 0 0 0'};
  app.HELPER_TEXT_STYLE = {
      margin: '8px 0 -3px 8px',
      fontSize: '12px',
      color: 'gray'
  };
  app.IMAGE_COUNT_LIMIT = 10;
  app.VIS_OPTIONS = {
    'False color (B5/B4/B3)': {
      description: 'Vegetation is shades of red, urban areas are ' +
                   'cyan blue, and soils are browns.',
      visParams: {gamma: 1, min: 500, max: 7000, bands: ['B5', 'B4', 'B3']}
    },
    'Natural color (B4/B3/B2)': {
      description: 'Ground features appear in colors similar to their ' +
                   'appearance to the human visual system.',
      visParams: {gamma: 1.3, min: 500, max: 7000, bands: ['B4', 'B3', 'B2']}
    },
    'Color Infrared (B8/B4/B3)': {
      description: 'Coast lines and shores are well-defined. ' +
                   'Vegetation appears blue.',
      visParams: {gamma: 1.3, min: 500, max: 7000, bands: ['B8', 'B4', 'B3']}
    },
    'Agriculture (B11/B8A/B2)': {
      description: 'Vegetation features appear in greens  ' +
                   'humidity in blues.',
      visParams: {gamma: 1.3, min: 500, max: 7000, bands: ['B11', 'B8A', 'B2']}
    },
    'SWIR (B12/B8/B4)': {
      description: 'Vegetation features appear in greens  ' +
                   'humidity in blues.',
      visParams: {gamma: 1.3, min: 500, max: 7000, bands: ['B12', 'B8', 'B4']}
    },
    'NDVI (B8-B4/B8+B4)': {
      description: 'Vegetation index  ' +
                   '',
      visParams:  {min: 0, max: 0.7,  palette:palette, bands: ['nd']}
    },
     'NDWI (B3-B8/B3+B8)': {
      description: 'Normalized Difference Water Index  ' +
                   '',
      visParams:  {min: -0.6, max: 0.1,  palette:palette2, bands: ['nd']}
    },
  };
};


/** Creates the application interface. */
app.boot = function() {
  app.createConstants();
  app.createHelpers();
  app.createPanels();
  var main = ui.Panel({
    widgets: [
      app.intro.panel,
      app.filters.panel,
      app.picker.panel,
      app.vis.panel,
      app.export.panel
    ],
    style: {width: '320px', padding: '8px'}
  });
  
  //Monegros Center//
Map.setCenter(-0.1081, 41.4208, 12);
  //La Mancha Center//
  //Map.setCenter(-3.1242,39.5062, 11);
  
  ui.root.insert(0, main);
  app.applyFilters();
  // Add the panel to the ui.root.

};
 



app.boot();

