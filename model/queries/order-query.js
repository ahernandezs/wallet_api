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
	Order.findOne().sort('-orderId').exec( function(err, doc) {
		var newOrder = new Order(order);
		newOrder['orderId'] = doc==null ? 1000 : doc.orderId+1 ;
		newOrder.save(function (err) {
			if (err){
		        console.log(err);
				callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order failed' });
			}else{
				callback(null, { statusCode: 0 ,  additionalInfo: 'Order success' });
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

exports.getOrders =  function(merchantID, callback) {
    console.log( 'getOrders from MongoDB with status: ' + config.orders.status );
    Order.find({ 'merchantId': merchantID , 'status': config.orders.status }, '_id customerImage customerName date status', function(err, orders)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.orders.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (orders.length === 0) {
            response = { statusCode: 0, additionalInfo: config.orders.emptyMsg }
            callback(null, response);
            console.log(config.orders.emptyMsg);
        } else {
            response = { statusCode: 0, additionalInfo: orders };
            callback(null, response);
            console.log(response);
        }
    });
};
