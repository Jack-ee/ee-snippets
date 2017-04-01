
Map.setCenter(-47.6735, -0.6344, 12);
var L8 = ee.ImageCollection('LANDSAT/LC8_L1T');
var img = ee.Algorithms.Landsat.simpleComposite({
  collection: L8.filterDate('2015-1-1', '2015-7-1'),
  asFloat: true});
  
  
var viz1 = {bands: 'B7,B6,B1', max: [0.3, 0.4, 0.3]}
var viz2 = {bands: 'B5,B4,B3', max: [0.3, 0.4, 0.3]}
function b1(){
  Map.addLayer(img, viz1, 'b1')
}
function b2(){
  // can we hide b1 then add b2?
  Map.addLayer(img, viz2, 'b2')
}

var panel = ui.Panel()
panel.style().set('width', '80px')
var nav = [{name:'Layer1', func:b1},{name:'Layer2', func:b2}]
.map(function (button){return ui.Button(button.name, button.func)})
panel.add(ui.Panel(nav, ui.Panel.Layout.flow('vertical')))
ui.root.insert(0, panel);