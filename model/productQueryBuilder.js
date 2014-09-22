var Product = require('./product');
var config = require('../model/config.js');

exports.getProducts =  function(merchantID, callback) {
    console.log( 'getProducts from MongoDB with status: ' + config.products.status );
    Product.find({ 'merchantId': merchantID , 'status': config.products.status }, '_id name description url cost status', function(err, products)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.products.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (products.length === 0) {
            response = { statusCode: 0, additionalInfo: config.products.emptyMsg }
            callback(null, response);
            console.log(config.products.emptyMsg);
        } else {
            response = { statusCode: 0, additionalInfo: products };
            callback(null, response);
            console.log(response);
        }
    });
};
