//Visualize burned areas in Bandipur National Park

var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

var maskClouds = function(image) {
  var pixelQA = image.select('pixel_qa');
  var cloud = getQABits(pixelQA, 5, 5, 'cloud');
  var shadow = getQABits(pixelQA, 3, 3, 'cloud_shadow');
  return image.updateMask(cloud.eq(0)).updateMask(shadow.eq(0))
}

var feature = ee.FeatureCollection('ft:1EiY1tsHB-xVB4EdCNdnFxA0e1M9e5a2bwrEy-vo6');

//pre fire data
var image1 = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
              .filterDate('2018-03-01', '2018-03-28')
              .filterBounds(feature)
              .map(maskClouds)
              .min());
              
//post fire data
var image2 = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
              .filterDate('2019-03-01', '2019-03-28')
              .filterBounds(feature)
              .map(maskClouds)
              .min());


var ndbrParams = {min: -1, max: 1, palette: ['blue', 'green', 'red']};

//normalized difference between shortwave and near infrared.
var ndbr1 = image1.normalizedDifference(['B5', 'B7']).rename('NDBR1');
Map.centerObject(feature,9);
//Map.addLayer(ndbr1.clip(feature), ndbrParams, 'pre fire');

var ndbr2 = image2.normalizedDifference(['B5', 'B7']).rename('NDBR2');
Map.centerObject(feature,9);
//Map.addLayer(ndbr2.clip(feature), ndbrParams, 'post fire');


//change in normalized difference burn ratio
var ndbr = ndbr1.subtract(ndbr2);
print(ndbr);

Map.centerObject(feature,9);
Map.addLayer(ndbr.clip(feature), ndbrParams, 'NDBR');

//VIIRS active fire points
var firepoints = ee.FeatureCollection('ft:1U0Bv_tnXTkpV99Y4zMHIhALjDTgMadBit7rQVpuP')
Map.centerObject(firepoints,10);
Map.addLayer(firepoints);
