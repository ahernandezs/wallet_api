var mongoose = require('mongoose');
var Product = require('../model/product');
var Productquery = require('../model/queries/product-query');
var Prizequery = require('../model/queries/prize-query');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.products =  function(req, res){
  console.log('POST method products');
  console.log(req.body);
    Productquery.getProducts(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.inventory = function(req, res) {
    console.log( 'POST method inventary' );
    console.log(req.body);
    Productquery.getInventory(req.body.merchantID, function(err, result) {
       res.json(result); 
    });
};

exports.updateInventory = function(req, res) {
    console.log( 'POST method updateInventory' );
    console.log(req.body);
    Productquery.updateInventory(req.body, function(err, result) {
        res.json(result);
    });
};

exports.getPrizes = function(req, res){
    console.log('GET method prizes');
    Prizequery.getPrizes(parseInt(req.query.top), function(err, result){
        res.json(result)
    });
}
