var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var productQuery = require('../../model/queries/product-query');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/urban-service');
var doxsService = require('../../services/doxs-service');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transferFlow = require('./transfer-flow');
var transacctionQuery = require('../../model/queries/transacction-query');
var messageQuery = require('../../model/queries/message-query');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

exports.sendGift = function(payload,callback) {
	var order = payload.order;
	var dateTime;
	var forReceipt = {};
	order['userId'] = payload.beneficiaryId;
	var payloadoxs = {phoneID: payload.phoneID, action: 'gift', type: 3}
	var id;
	var response;
	var name;
	var imageProduct;
    var emitter = payload.phoneID;
    var receiver = payload.beneficiaryPhoneID;

	async.waterfall([
		function(callback){
			dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			var payloadBody= payload.body;
			forReceipt.payload = payloadBody;
			Userquery.getName(payload.phoneID, function(err, resp) {
				name = resp;
				callback(null);
			});
		},
		function(callback){
			console.log('Get product image');
			productQuery.getProduct(payload.order.products[0].name ,function(err,result){
				if(err){
					var response = { statusCode:1 ,  additionalInfo : result };
					callback('ERROR',response);
				}else{
					imageProduct = result.url;
					callback(null);
				}
			});
		},
		function(callback){
			var requestSoap = { sessionid:payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
			soap.createClient(soapurl, function(err, client) {
				client.transfer(request, function(err, result) {
					if(err) {
						console.log('Error '+err);
						return new Error(err);
					} else {
						callback(null,payload.sessionid);
					}
				});
			});
		},
		function(sessionid, callback){
			console.log('balance e-wallet');
			var  request = { sessionid: sessionid, type: 1  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						console.log(response);
						if(response.result  === '0' )
							var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
						else
							var response = { statusCode:1 ,  additionalInfo : response };

						callback(null,sessionid,response.additionalInfo.current);
					}
				});
			});
		},
		function(sessionid,currentMoney, callback){
				Orderquery.putOrder(order, function(err,result){
				orderID = result.order;
				console.log('Order saving result: '+JSON.stringify(result));
				callback(null,sessionid,currentMoney);
			});
		},

		function(sessionid,currentMoney, callback){
			var requestBalance = { sessionid: sessionid, type: 3 };
			var request = { balanceRequest: requestBalance };
			console.log(request);
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						if(response.result  === '0' ) {
							dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
							var balance = { current : currentMoney , dox : response.current , doxAdded:config.doxs.gift,  order : orderID ,  status :'NEW' , date: dateTime } ;
							response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : balance };
						}else{
							var response = { statusCode:1 ,  additionalInfo : response };
						}
						callback(null,sessionid,response);
					}
				});
			});
		},

		function(sessionid, response, callback){
			var updateDoxs = {phoneID: payload.phoneID, operation: 'gift'};
			console.log('Saving doxs in mongo');
			Userquery.putDoxs(updateDoxs, function(err,result){
				callback(null,sessionid, response);
			});
		},
		function(sessionid, response, callback){
			doxsService.saveDoxs(payloadoxs, function(err, result){
				console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
				if(err) {
					return new Error(err);
				} else {
					callback(null, sessionid, response);
				}
			});
		},
        function(sessionid, response, callback){
            Userquery.getIdByPhoneID(payload.phoneID,function(err,result){
                var id = result._id;
                callback(null,sessionid,response,id);    
            });
        },
		function(sessionid,response, id, callback){
			Orderquery.putOrder(order, function(err,result){
				console.log('Order saving result: '+JSON.stringify(result));
                forReceipt.orderID = result.order;
				callback(null, sessionid, response, result);
			});
		},
        function(sessionid, response, result, callback){
            console.log('Save message in DB');
            var title = config.messages.giftMsg;
            var extraData = { action :1, giftID: result.order , additionalInfo: payload.additionalInfo };
            payload.extra = {extra : extraData} ;
            payload.status = config.messages.status.NOTREAD;
            payload.type = config.messages.type.GIFT;
            payload.title = title;
            payload.date = dateTime;
            //var twitterMsg = config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
			var twitterMsg = config.messages.twitterMsg;
			config.messages.twitter.message = twitterMsg;
            payload.additionalInfo = JSON.stringify( {
											phoneID: payload.phoneID,
											date: dateTime,
											name: name.name,
											avatar: config.S3.url + payload.phoneID +'.png',
											message: payload.message,
											product : payload.order.products[0].name,
											order: orderID,
											amount :payload.order.total,
											status: config.orders.status.NEW,
											doxAdded : 500 ,
											facebook:config.messages.facebook,
											twitter:config.messages.twitter,
										});

            var payloadMessage = payload;
            payloadMessage.phoneID = payload.beneficiaryPhoneID;

            messageQuery.createMessage(emitter,payloadMessage, function(err, result) {
                if (err) {
                    callback('ERROR', { statusCode: 1, additionalInfo: result });
                } else {
                    callback(null, response,result._id);
                }
            });
        },
		function(response,messageID,callback) {
			console.log('sending push');
			//var additionalInfo = { phoneID: payload.phoneID, name: name.name, avatar: config.S3.url + payload.phoneID +'.png', order:orderID, date:dateTime,message:payload.message};
			//console.log(additionalInfo);
			var title = 'You have received a coffee gift!';
			var message = payload.message;
			payload.message = title;
			var extraData = { action :2,additionalInfo:JSON.stringify(payload.additionalInfo),_id:messageID};
			payload.extra = {extra : extraData} ;
			payload.phoneID = payload.beneficiaryPhoneID;
			delete payload.beneficiaryPhoneID;
			urbanService.singlePush(payload, function(err, result) {
				callback(null,response,payload,emitter,receiver,message,payload.additionalInfo);
			});
		},
		function(balance,payload,emitter,receiver,message,additionalInfo,callback) {
			console.log( 'Create Receipt Gift for sender: ' + message);
			var receipt = {};
			receipt.emitter = emitter;
			receipt.receiver = receiver;
			receipt.amount = payload.order.total;
			receipt.message = message;
			receipt.additionalInfo = additionalInfo;
			receipt.title = "You have sent a coffee gift!";
			receipt.date = dateTime;
			receipt.type = 'GIFT';
			receipt.status = 'NEW';
			receipt.orderID = orderID;
			console.log(receipt);
			ReceiptQuery.createReceipt(receipt, function(err, result) {
				if (err)
					callback('ERROR', err);
				else
					callback(null, balance,receipt, message, additionalInfo);
			});
		},
        function(balance, receipt, message, additionalInfo, callback) {
            console.log( 'Create second receipt, this one for the receiver' );
            var newReceipt = {};
            newReceipt.emitter = receiver;
            newReceipt.receiver = emitter;
            newReceipt.amount = payload.order.total;
            newReceipt.message = message;
            var temp = JSON.parse(additionalInfo);
            delete temp.doxAdded;
            newReceipt.additionalInfo = JSON.stringify(temp);
            newReceipt.title = 'You have received a gift!';
            newReceipt.date = dateTime;
            newReceipt.type = 'GIFT';
            newReceipt.status = 'NEW';
            ReceiptQuery.createReceipt(newReceipt, function(err, result) {
               if (err)
                   callback('ERROR', errr);
                else
                    callback(null, balance, receipt);
            });
        },
		function(balance,receipt, callback) {
			console.log( 'Create  transacction Money' );
			var receiver;
			var transacction = {};
			transacction.title = 'Coffee gift';
			transacction.type = 'MONEY',
			transacction.date = dateTime;
			transacction.amount = (-1) * receipt.amount;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'GIFT';
			transacction.phoneID = emitter;
			Userquery.findAppID(receipt.receiver,function(err,result){
				transacction.description ='To ' + result.name;
				receiver = result.name;
				transacctionQuery.createTranssaction(transacction, function(err, result) {
					if (err)
						console.log('Error to create transacction');
					else{
						console.log( 'Create  transacction DOX' );
						var transacction = {};
						transacction.title = 'Coffee gift';
						transacction.type = 'DOX',
						transacction.date = dateTime;
						transacction.amount = config.doxs.gift;
						transacction.additionalInfo = receipt.additionalInfo;
						transacction.operation = 'GIFT';
						transacction.phoneID = emitter;
						transacction.description ='To ' + receiver;
						transacctionQuery.createTranssaction(transacction, function(err, result) {
							if (err)
								callback('ERROR', err);
							else {
								balance.date = dateTime;
                                balance.type = 'GIFT';
                                balance._id = balance.additionalInfo.order;
                                balance.additionalInfo.avatar = config.S3.url + emitter +'.png';
                                balance.additionalInfo.name = receiver;
                                balance.additionalInfo.amount = receipt.amount;
                                balance.title = 'You have sent a gift';
                                balance.additionalInfo.product = payload.order.products[0].name;
                                balance._id = forReceipt.orderID;
								callback(null, balance);
							}
						});
					}
				});
			});
		}
		], function (err, result) {
			if(err){
				callback("Error! "+err,result);
			}else{
				console.log('waterfall');
				console.log(result);
				callback(null,result);
			}
		});
}
