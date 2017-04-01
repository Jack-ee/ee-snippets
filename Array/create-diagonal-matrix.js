var y = ee.Array([[0],[1],[2],[3],[4],[5],[6],[7]]);
var I = ee.Array.identity(8);
var e = ee.Array([[1,0,0,0,0,0,0,0]]);
var t = y.matrixMultiply(y.transpose());
t = t.sqrt();
var diag = I.multiply(t);
