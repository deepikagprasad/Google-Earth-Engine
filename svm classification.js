
var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'];

var image = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
              .filterDate('2016-01-01', '2018-12-31')
              .filterBounds(roi)
              .sort('CLOUD_COVER')
              .first());


var training = image.sampleRegions({
  collection: polygons,
  properties: ['class'],
  scale: 30
});

var classifier = ee.Classifier.svm({
  kernelType: 'RBF',
  gamma: 0.5,
  cost: 10
});

// Train the classifier.
var trained = classifier.train(training, 'class', bands);

// Classify the image.
var classified = image.classify(trained);

var palette =['#efff6c',  //ag
              '#1e9e1c',//forest
              '#cf7a42'//settlements
              // '#4e9974', //grassland
              //'#3fc1ff' //water   
              ];

Map.centerObject(image, 10);
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], max: 0.5, gamma: 2});
Map.addLayer(classified, {min: 0, max: 3, palette: palette}, 'Land use');
    