var async = require('async');
var config = require('../../config.js');
var orderQuery = require('../../model/queries/order-query');
var messageQuery = require('../../model/queries/message-query');
var receiptQuery = require('../../model/queries/receipt-query');
var urbanService = require('../../services/urban-service');

exports.updateOrderFlow = function(payload,callback) {
	var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var status = payload.status;
	async.waterfall([
		function(callback){
			orderQuery.updateOrderbyOrderID(payload,function(err,result){
				if (err){
					console.log(err);
					callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order update failed' });
				}else{
					callback(null);
				}
			});
		},
		//enviar el número de orden
		function(callback){
			payload.date = dateTime;
 				receiptQuery.updateReceiptByOrder(payload,function(err,result){
				if (err){
					console.log(err);
					callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Receipt update failed' });
				}else{
					callback(null);
				}
			});		
		},

		function(callback){
			receiptQuery.getReceiptByOrderID(payload.orderID,function(err,result) {
				if (err){
					console.log(err);
					callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Error to get receipt' });
				}else{
					callback(null,result);
				}
			});
		},
		function(receipt,callback){
			console.log(receipt);
			var message = {};
			message.phoneID = receipt.emitter;
			message.title = 'Your order No' + payload.orderID +  ' is ' + status;
			message.type = 'BUY';
			message.status = status;
			message.additionalInfo = receipt.additionalInfo;
			message.date = dateTime;
			message.message = 'Your order No ' + payload.orderID +  ' is ' + status;
            messageQuery.createMessage(message.phoneID,message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                } else {
					var extraData = {   action: 1, additionalInfo : message.additionalInfo, _id: result._id};
					message.extra = {extra : extraData} ;
                    callback(null,message);
                }
            });
		},
		function(message, callback){
			urbanService.singlePush(message, function(err, result) {
				if (err) {
					var response = { statusCode: 1, additionalInfo: err };
					callback('ERROR', response);
				}else{
					var response = { statusCode: 0, additionalInfo: 'Update order successful' };
					callback(null,response);
				}
			});
		},
		], function(err, result) {
			if (err) 
				callback(err, result);
			else
				callback(null, result);   
		});
}
