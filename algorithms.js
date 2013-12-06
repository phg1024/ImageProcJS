/**
 * Created by Peihong Guo on 11/28/13.
 */
var algorithms = {};
require(["algorithms/mediancut",
    "algorithms/kmeans",
    "algorithms/neuralnetwork",
    "algorithms/filterfactory"],

    function() {
        algorithms.mediancut = mediancut;
        algorithms.kmeans = kmeans;
        algorithms.neuralnetwork = neuralnetwork;
        algorithms.createfilter = FilterFactory.createfilter;
    }
);