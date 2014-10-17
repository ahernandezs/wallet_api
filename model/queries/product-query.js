var Product = require('../product');
var config = require('../../config.js');

exports.getProducts =  function(merchantID, callback) {
    console.log( 'getProducts from MongoDB with status: ' + config.products.status );
    Product.find({ 'merchantId': merchantID , 'status': config.products.status }, '_id name description url cost status', function(err, products)  {
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
            response = { statusCode: 0, additionalInfo: products };
            callback(null, response);
            console.log(response);
        }
    });
};

exports.getInventory = function(merchantID, callback) {
    console.log( 'getInventory from MongoDB for merchantID: ' + merchantID );
    Product.find({ 'merchantId' : merchantID }, '_id name description url', function(err, inventory) {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.products.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (inventory.length === 0) {
            response = { statusCode: 0, additionalInfo: config.products.emptyInventory };
            callback(null, response);
            console.log( config.products.emptyInventory );
        } else {
            response = { statusCode: 0, additionalInfo: inventory };
            callback(null, response);
            console.log(response);
        }
    });
};

exports.updateInventory = function(product, callback) {
    console.log( 'verifying product in MongoDB' );
    Product.find({ '_id' : product._id }, '_id name url', function(err, products) {
        if (err) {
            callback('ERROR', { statusCode: 1,  message: 'Something went wrong' } );
            console.log( 'Something went wrong' );
        } else if (products.length === 0) {
            callback('ERROR', { statusCode: 1,  message: 'Failed Update (no product found)' } );
            console.log( 'Failed Update (no product found)' );
        } else {
            console.log( 'updateInventory in MongoDB with _id: ' +  product._id + ". New status: " + product.status);
            var conditions = product._id;
            delete product._id;
            Product.update( conditions, product, null, function(err, result) {
                if (err) {
                    callback('ERROR', { statusCode: 1,  message: 'Failed Update' } );
                    console.log( 'Failed Update' );
                } else {
                    callback( null, { statusCode: 0 ,  message: 'Successful Update' } );
                    console.log( 'Successful Update' );
                }
            });
        }
    });
};

exports.getProduct =  function(name, callback) {
    console.log( 'getProduct from MongoDB with status: ' + name );
    Product.find({ 'name': name }, 'url', function(err, products)  {
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
            response = { statusCode: 0, additionalInfo: products };
            callback(null, products[0]);
            console.log(products[0].url);
        }
    });
};
