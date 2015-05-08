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

exports.getOrder = function (ID,callback) {
	console.log('Get temporal order '+ID);
	Order.findOne({ '_id': ID }, 'orderId _id  phoneID customerImage customerName date status products userId total', function (err, order) {
	    if (err) return handleError(err);
	    else{
	    	callback(null,order);
	    }
	});
}
