var mongoose = require('mongoose');
var Product = require('../model/merchant');
var soap = require('soap');
var soapurl = 'http://152.186.37.50:8280/services/umarketsc?wsdl';

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
