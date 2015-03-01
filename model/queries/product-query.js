var Product = require('../product');
var Product2 = require('../product2');
var config = require('../../config.js');

exports.getProducts =  function(merchantID, callback) {
    console.log( 'getProducts from MongoDB with status: ' + config.products.status );
    var query = Product.find({ 'merchantId': merchantID , 'status': config.products.status });
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
            response = { statusCode: 0, additionalInfo: products };
            callback(null, response);
        }
    });
};

exports.getProductsDiscount =  function(merchantID, callback) {
    console.log( 'getProducts discount from MongoDB with status: ' + config.products.status );
    var query =  Product2.find({}, 'productID name description url cost status discount');
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
            response = { statusCode: 0, additionalInfo: products };
            callback(null, response);
        }
    });
};

exports.getInventory = function(merchantID, callback) {
    console.log( 'getInventory from MongoDB for merchantID: ' + merchantID );
    Product.find({ 'merchantId' : merchantID }, '_id name description url status', function(err, inventory) {
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
    var query = { '_id': product._id};
    delete product._id;
    var options = { new: false };
    Product.findOneAndUpdate(query, product, options, function (err, product) {
    if (err){
          callback("ERROR", { statusCode: 1 ,  additionalInfo: err });
      }
      else if(!product)
          callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Product not  Found' });
      else
          callback( null, { statusCode: 0 ,  message: 'Successful Update' } );
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
