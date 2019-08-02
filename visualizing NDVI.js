
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
    .filter(ee.Filter.eq('WRS_PATH', 145))
    .filter(ee.Filter.eq('WRS_ROW', 51))
    .filterDate('2017-01-01', '2017-12-31')
    .filter(ee.Filter.lt('CLOUD_COVER', 0.1));

var image = collection.median();

var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');

var imageNDVI = ee.Image(image).addBands(ndvi);

Map.centerObject(roi,10);
Map.addLayer(imageNDVI, {bands: ['B4', 'B3', 'B2'], max: 0.4}, 'imageNDVI');

var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi, ndviParams, 'NDVI image');

Export.image.toDrive({
  image: ndvi,
  description: 'NDVI',
  scale: 30
  //region: roi
});
