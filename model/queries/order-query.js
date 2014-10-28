var Order = require('../order');
var config = require('../../config.js');

exports.validateOrders = function(userID,callback){
	console.log('Search user in mongoDB');
	Order.find({ 'userId': userID }, '_id userId products.name products.quantity products.cost total date status', function (err, person) {
		if (err) return handleError(err); 
		else if(!person)
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'User is not yet registered' });
		else{
			var  response =   { statusCode: 0 ,  additionalInfo: person };
			callback(null, response);
		}
	});
};

exports.putOrder = function(order,callback){
    console.log(order);
	Order.findOne().sort('-orderId').exec( function(err, doc) {
        console.log(doc);
		var newOrder = new Order(order);
		newOrder['orderId'] = doc==null ? 1000 : doc.orderId+1 ;
        console.log(newOrder);
		newOrder.save(function (err,result) {
			if (err){
		        console.log(err);
				callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order failed' });
			}else{
				callback(null, { statusCode: 0 ,  additionalInfo: 'Order success', order:result.orderId });
			}
		});
	});
}

exports.updateOrder = function(payload,callback){
	var conditions = payload._id
	delete payload['_id'];
	Order.update(conditions, payload, null, function(err, result) {
		if (err){
			console.log(err)
			callback("ERROR", { statusCode: 1,  additionalInfo: 'Update Fail' });
		}else{
			callback(null, { statusCode: 0 ,  additionalInfo: 'Update success' });
		}
	});
};

exports.updateOrderbyOrderID = function(payload,callback){
	var conditions = payload.orderID
	Order.update({'orderId':conditions}, payload, null, function(err, result) {
		if (err){
			console.log(err)
			callback("ERROR", { statusCode: 1,  additionalInfo: 'Update Fail' });
		}else{
			callback(null, { statusCode: 0 ,  additionalInfo: 'Update success' });
		}
	});
};

exports.getOrders =  function(merchantID, callback) {
	var condiciones = {$or: [	{'status':config.orders.status.DELIVERED },
								{'status':config.orders.status.CANCELED}]}
    var  deliveredAndCanceled = Order.find(condiciones, 'orderId _id customerImage customerName date status products userId');
	deliveredAndCanceled.limit(10);
	deliveredAndCanceled.exec(function (err1, ordenes) {
		var response = { statusCode: 0, additionalInfo: ordenes };
		var conditions = {$or: [{'status':config.orders.status.NEW },
								{'status':config.orders.status.IN_PROGRESS},
								{'status':config.orders.status.READY}]};
		Order.find(conditions, 'orderId _id customerImage customerName date status products userId', function(err, orders)  {
	        if (err) {
	            response = { statusCode: 1, additionalInfo: config.orders.errMsg };
	            callback("ERROR: " + JSON.stringify(err.message), response);
	        } else {
				if(orders.length != 0){
					response.additionalInfo.push(orders);
	            }
	            if(response.additionalInfo.length === 0){
		            response = { statusCode: 0, additionalInfo: config.orders.emptyMsg }
		            callback(null, response);
	            }else
		            callback(null, response);
	        }
		});
	});
};
