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

exports.update = function(orderID, status, callback){
	var conditions = orderID
	Order.update(conditions, {  'status': status }, null, function(err, result) {
		if (err){
			console.log(err)
			callback("ERROR", { statusCode: 1,  additionalInfo: 'Update Fail' });
		}else{
			callback(null, { statusCode: 0 ,  additionalInfo: 'Update success' });
		}
	});
}

exports.getOrder = function (ID,callback) {
	console.log('Get temporal order '+ID);
	 async.waterfall([
    	function(callback){
			Order.findOne({ 'orderID': ID }, function (err, order) {
		    	if (err) callback('ERROR',err);
		    	else{
				callback(null,order);
		    }
		})
	}
	], function (err, result) {
      if(err){
        callback(err,result);
      }else{
        callback(null,result);
      }
    });
}