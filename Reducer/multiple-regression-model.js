
// Take an image
var image = ee.Image('LANDSAT/LT5_SR/LT50110291984196');

// Add a spectral indice 
image = image.addBands(image.normalizedDifference(['B4', 'B3']).rename('NDVI'));

// Select only the desired bands for the regression
image = image.select(['B1', 'B2', 'B3', 'NDVI']);

// Create a multiple regression model (Dependent variable: 'NDVI', Independent variables: 'B1', 'B2', 'B3')
var regressionOutput = image.reduceRegion({
                          reducer: ee.Reducer.linearRegression({numX: 3, numY: 1}),
                          maxPixels: 1e10
                        });
var coefficents = regressionOutput.select(['coefficients']);

print(coefficents.values());