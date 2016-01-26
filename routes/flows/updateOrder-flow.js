var async = require('async');
var moment = require('moment-timezone');
var config = require('../../config.js');
var orderQuery = require('../../model/queries/order-query');
var messageQuery = require('../../model/queries/message-query');
var receiptQuery = require('../../model/queries/receipt-query');
var urbanService = require('../../services/notification-service');

exports.updateOrderFlow = function(payload,callback) {
	var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
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
		function(callback){
			receiptQuery.getReceiptByOrderID(payload.orderID,function(err,result) {
				if (err){
					console.log(err);
					callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Error to get receipt' });
				}else{
					var receipt = result;
					var additionalInfoJSON = JSON.parse(receipt.additionalInfo);
					additionalInfoJSON.status = status;
					payload.additionalInfo = JSON.stringify(additionalInfoJSON);
					receiptQuery.updateReceiptByOrder(payload,function(err,result){
						if (err){
							console.log(err);
							callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Receipt update failed' });
						}else{
							callback(null,receipt);
						}
					});
				}
			});
		},
		function(receipt,callback){
            messageQuery.getMessageByOrderID(payload.orderID, function(err,result){
                if (err) {
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                } else if(result){
					var messageUpdate = JSON.parse(JSON.stringify(result));
					var additionalInfoJSON = JSON.parse(receipt.additionalInfo);
					additionalInfoJSON.status = status;
					messageUpdate.phoneID = receipt.emitter;
					messageUpdate.message =  'Your order No ' + payload.orderID +  ' is ' + status;
					messageUpdate.title = messageUpdate.message;
					messageUpdate.additionalInfo = JSON.stringify(additionalInfoJSON);
					var actionType ;
					if(messageUpdate.type === config.messages.type.BUY) actionType = config.messages.action.BUY;
					else if(messageUpdate.type === config.messages.type.GIFT) actionType = config.messages.action.GIFT;
					else if(messageUpdate.type === config.messages.type.LOAN) actionType = config.messages.action.LOAN;
					else if(messageUpdate.type === config.messages.type.TRANSFER) actionType = config.messages.action.TRANSFER;
					else if(messageUpdate.type === config.messages.type.COUPON) actionType = config.messages.action.COUPON;
					var extraData = {   action: actionType, additionalInfo : messageUpdate.additionalInfo, _id: messageUpdate._id};
					messageUpdate.extra = {extra : extraData} ;
		            messageQuery.updateMessageByOrderID(messageUpdate, function(err, result) {
						if (err){
							console.log(err);
							callback("ERROR", { statusCode: 1 ,  additionalInfo: 'message update failed' });
						}else{
							callback(null,messageUpdate);
						}
		            });

                } else {
					var message = {};
					message.phoneID = receipt.emitter;
					message.title = 'Your order No ' + payload.orderID +  ' is ' + status;
					message.type = receipt.type;
					message.status = 'NOTREAD';
					var additionalInfoJSON = JSON.parse(receipt.additionalInfo);
					additionalInfoJSON.status = status;
					message.additionalInfo =  JSON.stringify(additionalInfoJSON);
					message.date = dateTime;
					message.message = 'Your order No ' + payload.orderID +  ' is ' + status;
					message.orderID = payload.orderID;
		            messageQuery.createMessage(message.phoneID,message, function(err, result) {
		                if (err) {
		                    var response = { statusCode: 1, additionalInfo: err };
		                    callback('ERROR', response);
		                } else {
							var actionType ;
							if(message.type === config.messages.type.BUY) actionType = config.messages.action.BUY;
							else if(message.type === config.messages.type.GIFT) actionType = config.messages.action.GIFT;
							else if(message.type === config.messages.type.LOAN) actionType = config.messages.action.LOAN;
							else if(message.type === config.messages.type.TRANSFER) actionType = config.messages.action.TRANSFER;
							else if(message.type === config.messages.type.COUPON) actionType = config.messages.action.COUPON;
							var extraData = {   action: actionType, additionalInfo : message.additionalInfo, _id: result._id};
							message.extra = {extra : extraData} ;
		                    callback(null,message);
		                }
		            });
                }
            });
		},
		function(message, callback){
			console.log('Send message to customer');
			if((status === config.orders.status.READY) || (status === config.orders.status.DELIVERED)){
				urbanService.singlePush(message, function(err, result) {
					if (err) {
						var response = { statusCode: 3, additionalInfo: 'Error to send notification' };
						callback('ERROR', response);
					}else{
						var response = { statusCode: 0, additionalInfo: 'Update order successful' };
						callback(null,response);
					}
				});
			}else{
				var response = { statusCode: 0, additionalInfo: 'Update order successful' };
				callback(null,response);
			}
		},
		], function(err, result) {
			if (err) 
				callback(err, result);
			else
				callback(null, result);   
		});
}
