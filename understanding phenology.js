
var trainingdata = ee.FeatureCollection('ft:1Uu8UIQD8WJvpqKKz7aUI5Af8XZNjiqf2Il4MlKTg');
//Print and display the FeatureCollection.
//print(fc);
//Map.addLayer(fc, {}, 'From Fusion Table');

///////////////// global functions //////////////////////////////////////
/*
 * A function that returns an image containing just the specified QA bits.
 *
 * Args:
 *   image - The QA Image to get bits from.
 *   start - The first bit position, 0-based.
 *   end   - The last bit position, inclusive.
 *   name  - A name for the output image.
 */
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

var imageseries = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                    .filterBounds(trainingdata)
                    .filterDate('2017-01-01', '2017-12-31')
                    .select(['B[4-5]','pixel_qa'])
                    .map(maskClouds);

var sr = imageseries.map(function(i){
  return i.reduceRegions({
    collection: trainingdata,
    reducer: ee.Reducer.mean(),
    scale: 30});
});

Export.table(sr.flatten(), 'training_forest');

//Create and print the chart.
print(ui.Chart.image.series(imageseries, trainingdata, ee.Reducer.mean(), 30));


    
                    