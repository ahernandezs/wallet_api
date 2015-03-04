var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var moment = require('moment-timezone');
var Orderquery = require('../../model/queries/order-query');
var productQuery = require('../../model/queries/product-query');
var Userquery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/notification-service');
var doxsService = require('../../services/doxs-service');
var transferFlow = require('./transfer-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var logger = config.logger;
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');

exports.buyFlow = function(payload,callback) {
	var order = payload.order;
	var dateTime;
	var buy = {sessionid:'', target:'airtime', type:1, amount:5};
	var balance = {sessionid:'',type:1};
    var notification = {message:'There is a new order!', phoneID: payload.phoneID}
	var orderID;
	var response;
    var forReceipt = {};
    var additionalInfo;
    var imageProduct;
    forReceipt.payload = payload;

	async.waterfall([
		function(callback){
			var requestSoap = { sessionid: payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
				soap.createClient(soapurl, function(err, client) {
				client.transfer(request, function(err, result) {
					if(err) {
						logger.error(err);
						return new Error(err);
					} else {
						var response = result.transferReturn;
						if(response.result != 0){
							var response = { statusCode:1 ,  additionalInfo : result };
							callback("ERROR", response);
						}
						else{
							callback(null,payload.sessionid);
						}
					}
				});
			});
		},

		function(sessionid,callback){
			payload['action']='payment';
			doxsService.saveDoxs(payload, function(err, result){
				logger.info('Transfer result: '+JSON.stringify(result)+'\n\n');
				if(err) {
					return new Error(err);
				} else {
					callback(null,sessionid);
				}
			});
		},

		function(sessionid, callback){
			var updateDoxs = {sessionid:sessionid, phoneID: payload.phoneID, operation: 'payment'};
			logger.info('Saving doxs in mongo');
			Userquery.putDoxs(updateDoxs, function(err,result){
				logger.info(sessionid);
				callback(null,sessionid);
			});
		},
        
        function(sessionid, callback) {
            logger.info('search user by phoneID');
              Userquery.findUserByPhoneID(payload.phoneID,function(err,result){
                if(err){
                    var response = { statusCode:1 ,  additionalInfo : err };
                    callback('ERROR',response);
                  }
                  else{
                  	order.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
                    order.customerName = result.name;
                    order.customerImage = config.S3.url + payload.phoneID +'.png',
                    order.merchantId = payload.merchantID;
                    callback(null,sessionid);
                  }
              });  
        },

		function(sessionid,callback){
			logger.info('Saving order ');
			Orderquery.putOrder(order, function(err,result){
				orderID = result.order;
				logger.info('Order saving result: '+JSON.stringify(result)+'\n\n');
				callback(null, sessionid);
			});
		},
		function(sessionid,callback) {
			var message = 'There is a new order!';
			notification.message = message;
			var extraData = { action : 3 , order : JSON.stringify(order) };
			additionalInfo = extraData.order;
			notification.extra = {extra : extraData} ;
			urbanService.singlePush2Merchant(notification, function(err, result) {
				if(err){
					var response = { statusCode:1 ,  additionalInfo : result };
					callback('ERROR',response);
				}else{
					var response = { statusCode:0 ,  additionalInfo : result };
					callback(null,sessionid);
				}
			});
        },

		function(sessionid, callback){
			logger.info('balance e-wallet');
			var  request = { sessionid: sessionid, type: 1  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						if(response.result  === '0' )
							var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
						else
							var response = { statusCode:1 ,  additionalInfo : response };

						callback(null,sessionid,response.additionalInfo.current);
					}
				});
			});
		},

		function(sessionid,currentMoney ,callback){
			logger.info('Get product image');
			productQuery.getProduct(payload.order.products[0].name ,function(err,result){
				if(err){
					var response = { statusCode:1 ,  additionalInfo : result };
					callback('ERROR',response);
				}else{
					imageProduct = result.url;
                    config.messages.facebook.picture = imageProduct;
					callback(null,sessionid,currentMoney);
				}
			});
		},

		function(sessionid,currentMoney, callback){
			logger.info('balance Points');
			var  request = { sessionid: sessionid, type: 3  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						var twitterMsg = {};
						//twitterMsg = config.messages.twitter1 + payload.order.products[0].name + config.messages.twitter2 + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0,19); +'!!!';
						//var twitterMsg = config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0,19););
                        dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
						var twitterMsg = config.messages.twitterMsg + dateTime.substr(11, 5);
						config.messages.twitter.message = twitterMsg;
						if(response.result  === '0' ) {
							var balance = {
								current: currentMoney,
								dox: response.current,
								doxAdded: config.doxs.payment,
								order: orderID,
								status:'NEW',
								date:dateTime,
								twitter: config.messages.twitter,
								facebook:config.messages.facebook,
								picture : imageProduct
							};
							logger.info(config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0,19)));
							response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : balance };
						}
						else
							var response = { statusCode:1 ,  additionalInfo : response };
						callback(null,response);
					}
				});
			});
		},
		function(response, callback) {
			    logger.info('Create receipt buy');
			    data = forReceipt.payload;
			    var receipt = {};
			    receipt.emitter = data.phoneID;
			    receipt.receiver = 'merchant';
			    receipt.title = 'You have bought a coffee of € ' + data.order.total;
			    receipt.additionalInfo = JSON.stringify(response.additionalInfo);
			    receipt.amount = data.order.total;
			    receipt.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
			    receipt.type = 'BUY';
			    receipt.status = 'NEW';
			    receipt.orderID = orderID;
			    ReceiptQuery.createReceipt(receipt, function(err, result) {
			        if (err)
			            callback('ERROR', result.message);
			        else{
			            callback(null, response,receipt);
			        }
			    });
			
		},
		function(balance,receipt, callback) {
			logger.info( 'Create  transacction money' );
			var transacction = {};
			transacction.title = 'Amdocs cafe ';
			transacction.type = 'MONEY',
			transacction.date = dateTime;
			transacction.amount = (-1) * receipt.amount;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'BUY';
			transacction.phoneID = receipt.emitter;
			transacction.description ='Order No '+ orderID;
			transacctionQuery.createTranssaction(transacction, function(err, result) {
				if (err)
					logger.error('Error to create transacction');
				else{
					logger.info(result);
				}
			});
			logger.info( 'Create  transacction DOX' );
			var transacction = {};
			transacction.title = 'Amdocs cafe ';
			transacction.type = 'DOX',
			transacction.date = dateTime;
			transacction.amount = config.doxs.payment;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'BUY';
			transacction.phoneID = receipt.emitter;
			transacction.description ='Order No '+ orderID;
			transacctionQuery.createTranssaction(transacction, function(err, result) {
				if (err)
					callback('ERROR', err);
				else{
					logger.info(result);
					callback(null, balance);
				}
			});
		},

    ], function (err, result) {
      if(err){
      	console.log('Error  --->' + JSON.stringify(result));
        callback("Error! "+err,result);    
      }else{
        callback(null,result);    
      }
    });
};

