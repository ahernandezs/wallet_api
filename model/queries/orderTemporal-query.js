var Order = require('../orderTemporal');
var config = require('../../config.js');
var async = require('async');

exports.saveOrder = function(order,callback){
	var newOrder = new Order(order);
	newOrder.save(function (err,result) {
		if (err){
	        console.log(err);
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order failed' });
		}else{
			callback(null, { statusCode: 0 ,  additionalInfo: 'Order success', order:result._id });
		}
	});
}

