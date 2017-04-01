
/*
Construct a polygon from min/max coordinates
*/
function boundingBox(minx, miny, maxx, maxy) {
  return ee.Geometry.Polygon([
    [[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny], [minx, miny]]
  ]  
)}

var zoom = 14;

/*
get the x/y coordinate 
*/
function getTileLL(i, j, z) {
  var x = ee.Number(360).divide(ee.Number(2).leftShift(z)).multiply(i).subtract(180);
  var y = ee.Number(180).divide(ee.Number(1).leftShift(z)).multiply(j).subtract(90);
  return [x,y];

}

function getTile(lon, lat, zoom) {
  /*
  * Looking for the first tile from left
  */
  var nX = 2 << zoom; //tiles for x at zoom
  //var nY = 1 << zoom; //tiles for y at zoom

  var step = 360 / nX; //tile width
  var Xt = Math.floor((lon + 180) / step);
  var Yt = Math.floor((lat +  90) / step);

  return [Xt, Yt, zoom];
}

var ll = getTile(10, 4, zoom);
var ur = getTile(12, 6, zoom);


var ix = ee.List.sequence(ll[0], ur[0])
var iy = ee.List.sequence(ll[1], ur[1])


var tiles = ix.map(function(i) {
  return iy.map(function(j) {
      var ii = ee.Number(i)
      var jj = ee.Number(j)
      
      var tileLL = getTileLL(ii, jj, zoom);
      var tileUR = getTileLL(ii.add(1), jj.add(1), zoom);
      
      var poly = boundingBox(tileLL[0], tileLL[1], tileUR[0], tileUR[1]);

      var tileId = ee.String('').cat(ii.int()).cat('_').cat(jj.int())
      return ee.Feature(poly, {tileId: tileId});
  })
}).flatten()

var tileGeometries = ee.FeatureCollection(tiles);

Map.addLayer(tileGeometries);
