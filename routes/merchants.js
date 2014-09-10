var mongoose = require('mongoose');
var Product = require('../model/merchant');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.merchants =  function(req, res){
  console.log('execute GET method merchants');
  console.log(req.body);
    Product.find(function(err,data){
        console.log(data);
        if(err)
             res.send(err);
        res.json(data);
    });
};
