var Order = require('../shopOrder');
var config = require('../../config.js');
var async = require('async');

exports.putOrder = function(order,callback){
	Order.findOne().sort('-orderID').exec( function(err, doc) {
		var newOrder = new Order(order);
		newOrder['orderID'] = doc==null ? 1000 : doc.orderID+1 ;
		newOrder.save(function (err,result) {
			if (err){
		        console.log(err);
				callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order failed' });
			}else{
				callback(null, { statusCode: 0 ,  additionalInfo: 'Order success', order:result.orderID });
			}
		});
	});
}

exports.update = function(order,callback){
	var conditions = orderID
	Order.update(conditions, payload, null, function(err, result) {
		if (err){
			console.log(err)
			callback("ERROR", { statusCode: 1,  additionalInfo: 'Update Fail' });
		}else{
			callback(null, { statusCode: 0 ,  additionalInfo: 'Update success' });
		}
	});
}