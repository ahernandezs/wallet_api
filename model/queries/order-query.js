var Order = require('../order');
var OrderTemporal = require('../orderTemporal');
var config = require('../../config.js');
var async = require('async');

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

    async.waterfall([

		function(callback){
			var conditionsCanceled= { 'status':config.orders.status.CANCELED }
			var canceled = Order.find(conditionsCanceled, 'orderId _id customerImage customerName date status products userId');
			canceled.sort({orderId: -1});
			canceled.limit(10);
			canceled.exec(function (err1, ordersCanceled) {
				callback(null,ordersCanceled);
			});
		},

		function(ordersCanceled, callback){
			var conditionsDelivered= { 'status':config.orders.status.DELIVERED }
			var delivered = Order.find(conditionsDelivered, 'orderId _id customerImage customerName date status products userId');
			delivered.sort({orderId: -1});
			delivered.limit(10);
			delivered.exec(function (err1, ordersDelivered) {
				callback(null, ordersCanceled, ordersDelivered);
			});
		},

		function(ordersCanceled,ordersDelivered, callback){
			var conditionsDelivered= { 'status':config.orders.status.PENDING }
			var pending = OrderTemporal.find(conditionsDelivered, 'orderId _id customerImage customerName date status products userId');
			pending.sort({orderId: -1});
			pending.exec(function (err1, ordersPending) {
				console.log(ordersPending);
				callback(null, ordersCanceled, ordersDelivered,ordersPending);
			});
		},

		function(ordersCanceled, ordersDelivered, ordersPending, callback){

			var response = { statusCode: 0 };
			var conditions = {$or: [{'status':config.orders.status.NEW },{'status':config.orders.status.READY}]};
			var ordenes = Order.find(conditions, 'orderId _id customerImage customerName date status products userId');
			ordenes.sort({date: -1});
			ordenes.exec(function (err, orders){

				if (err) {
					response = { statusCode: 1, additionalInfo: config.orders.errMsg };
					callback("ERROR: " + JSON.stringify(err.message), response);
				} else {
					if(orders.length != 0){
						ordersCanceled = ordersCanceled.concat(ordersDelivered);
						ordersCanceled = ordersCanceled.concat(ordersPending);
						var ordersMerge = ordersCanceled.concat(orders);
						response.additionalInfo = ordersMerge;
					}
					if(!(response.additionalInfo) || response.additionalInfo.length === 0){
						response = { statusCode: 0, additionalInfo: config.orders.emptyMsg }
						callback(null, response);
					}else
					callback(null, response);
				}

			});

		}

    ], function (err, result){
        callback(null,result);
    });


/*
	var conditionsCanceled= { 'status':config.orders.status.CANCELED }
	var  canceled = Order.find(conditionsCanceled, 'orderId _id customerImage customerName date status products userId');
	canceled.sort({orderId: -1});
	canceled.limit(10);

	canceled.exec(function (err1, ordersCanceled) {

		var conditionsDelivered= { 'status':config.orders.status.DELIVERED }
		var  delivered = Order.find(conditionsDelivered, 'orderId _id customerImage customerName date status products userId');
		delivered.sort({orderId: -1});
		delivered.limit(10);
		delivered.exec(function (err1, ordersDelivered) {

			var response = { statusCode: 0 };
			var conditions = {$or: [{'status':config.orders.status.NEW },
			{'status':config.orders.status.READY}]};
			Order.find(conditions, 'orderId _id customerImage customerName date status products userId', function(err, orders)  {
				if (err) {
					response = { statusCode: 1, additionalInfo: config.orders.errMsg };
					callback("ERROR: " + JSON.stringify(err.message), response);
				} else {
					if(orders.length != 0){
						ordersCanceled = ordersCanceled.concat(ordersDelivered);
						var ordersMerge = ordersCanceled.concat(orders);
						response.additionalInfo = ordersMerge;
					}
					if(response.additionalInfo.length === 0){
						response = { statusCode: 0, additionalInfo: config.orders.emptyMsg }
						callback(null, response);
					}else
					callback(null, response);
				}
			});
		});
	});
*/
};
