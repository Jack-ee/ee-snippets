var map = [];
'Left Right'.split(' ').forEach(function(name, index) {
  var m = ui.Map();
  m.setCenter(31.99974, 30.46969, 13)
  m.setOptions('SATELLITE').setControlVisibility(null, null, false, false, false).style().set('cursor', 'crosshair')
  map.push(m);
});
ui.root.widgets().reset([
  ui.Panel(
      [map[0]],
      ui.Panel.Layout.Flow('vertical'),
      {stretch: 'both'}),
  ui.Panel(
      [map[1]],
      ui.Panel.Layout.Flow('vertical'),
      {stretch: 'both'}),
]);
ui.Map.Linker(map);