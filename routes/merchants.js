var Orderquery = require('../model/queries/order-query');
var merchant = require('../model/merchant');
var merchantQuery = require('../model/queries/merchant-query');
var updateOrder = require('../routes/flows/updateOrder-flow');

exports.merchants =  function(req, res){
  console.log('execute GET method merchants! ');
  var phoneID = req.headers['x-phoneid'];
  merchantQuery.getMerchants(phoneID, function(err, result){
    res.json(result);
  })
};

exports.getOrderHistory = function(req,res){
	Orderquery.validateOrders(req.body.userID, function(err,result){
		res.json(result);
	});
};

exports.putOrder = function(req,res){
  Orderquery.putOrder(req.body, function(err,result){
    if(err)
         res.send(err);
    res.json(result);
  });
};

exports.updateOrder = function(req, res){
  updateOrder.updateOrderFlow(req.body, function(err,result){
    if(err)
         res.send(err);
    else
      res.json(result);  
  });
};

exports.getOrders = function(req, res) {
    console.log( 'execute POST method getOrders' );
    Orderquery.getOrders(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.register = function(req, res) {
  console.log( 'execute POST method updateMerchant' );
  merchantQuery.updateMerchantByID(req.body , function(err,result){
    if(err) {
      res.send(500);
    } else {
      console.log(result);
      res.json(result);
    }
  });
};
