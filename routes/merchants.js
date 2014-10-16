var Orderquery = require('../model/queries/order-query');
var merchantQuery = require('../model/queries/order-query');
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

exports.getOrderHistory = function(req,res){
	console.log(req.body)
	Orderquery.validateOrders(req.body.userID, function(err,result){
		res.json(result);
	});
	console.log(req.body);
};

exports.putOrder = function(req,res){
  Orderquery.putOrder(req.body, function(err,result){
    if(err)
         res.send(err);
    res.json(result);
  });
};

exports.updateOrder = function(req, res){
  Orderquery.updateOrder(req.body, function(err,result){
    if(err)
         res.send(err);
    res.json(result);  });
};

exports.getOrders = function(req, res) {
    console.log( 'execute POST method getOrders' );
    console.log( req.body );
    Orderquery.getOrders(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.register = function(req, res) {
  console.log( 'execute POST method updateMerchant' );
  console.log( req.body );
  merchantQuery.update(req , function(err,result){
    if(err) {
      res.send(500);
    } else {
      console.log(result);
      res.json(result);
    }
  });
};
