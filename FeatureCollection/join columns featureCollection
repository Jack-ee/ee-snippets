// Create the primary collection.
var f1 = ee.FeatureCollection([
  ee.Feature(null, {id: 0, label: 'a'}),
  ee.Feature(null, {id: 1, label: 'b'}),
  ee.Feature(null, {id: 2, label: 'c'}),
  ee.Feature(null, {id: 3, label: 'd'}),
]);

var f2 = ee.FeatureCollection([
  ee.Feature(null, {id: 0, text: 'a'}),
  ee.Feature(null, {id: 1, text: 'b'}),
  ee.Feature(null, {id: 2, text: 'c'}),
  ee.Feature(null, {id: 3, text: 'd'}),
]);

function leftjoin(left, right, field) {
  return left.map(function (f){
    return f.setMulti(right.filter(ee.Filter.eq(field, f.get(field))).first().toDictionary())
  })
}

var ret = leftjoin(f1, f2, 'id');

// Print the result.
print(ret)

// ee.FeatureCollection([
//   ee.Feature(null, {id: 0, label: 'a', text: 'a'}),
//   ee.Feature(null, {id: 1, label: 'a', text: 'b'}),
//   ee.Feature(null, {id: 2, label: 'a', text: 'c'}),
//   ee.Feature(null, {id: 3, label: 'a', text: 'd'}),
// ]);