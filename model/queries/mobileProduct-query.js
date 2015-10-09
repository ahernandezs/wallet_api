var Product = require('../mobileProduct');
var config = require('../../config.js');
var timeService = require('../../services/time-service');

exports.getMobileProducts =  function(callback) {
    console.log( 'getProducts from MongoDB with status: ' + config.products.status );
    var query = Product.find({});
    query.sort({productID:1});
    query.exec(function(err,products){
            var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.products.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (products.length === 0) {
            response = { statusCode: 0, additionalInfo: config.products.emptyMsg };
            callback(null, response);
            console.log(config.products.emptyMsg);
        } else {
            console.log(products);
            response = { statusCode: 0, additionalInfo: products };
            console.log("BEfore");
            callback(null, response);
        }
    });
};