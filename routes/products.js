var mongoose = require('mongoose');
var Product = require('../model/product');
var Productquery = require('../model/productQueryBuilder');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.products =  function(req, res){
  console.log('POST method products');
  console.log(req.body);
    Productquery.getProducts(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};
