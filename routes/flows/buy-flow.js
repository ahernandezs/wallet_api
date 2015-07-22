var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var moment = require('moment-timezone');
var Orderquery = require('../../model/queries/order-query');
var orderQueryTemporal = require('../../model/queries/orderTemporal-query');
var productQuery = require('../../model/queries/product-query');
var Userquery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var sessionQuery = require('../../model/queries/session-query')
var urbanService = require('../../services/notification-service');
var doxsService = require('../../services/doxs-service');
var transferFlow = require('./transfer-flow');
var purchaseFlow = require('./buy-flow');
var loginFlow = require('./login-flow');
var soapurl = process.env.SOAP_URL;
var buyFlow = require('./buy-flow');
var config = require('../../config.js');
var logger = config.logger;
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var citiService = require('../../services/citi-service');

exports.buyFlow = function(payload,callback) {
	var order = payload.order;
	console.log('--------------');
	console.log(payload.order);
	console.log('--------------');
	console.log(payload);
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

		function(callback) {
			console.log('Verify Enable purchase');
			if(process.env.ENABLE_RULE_PURCHASE === 'TRUE'){
	            Userquery.findUserBuys(payload.phoneID, function(err,transfers){
	                if(err){
	                    var response = { statusCode: 1, additionalInfo: err };
	                    callback('ERROR', response);
	                }
	                else
	                    callback(null);
	            });
			}else
				callback(null);
        },

		function(callback){
			console.log('Transfer purchase to merchant');
			var requestSoap = { sessionid: payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
			console.log(request);
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

		/*Create Payment in API citi*/
		/*function(sessionid,callback){
			console.log('Transfer using API city');
			payload['action']='payment';
			citiService.payment(payload.order.total, function(err, result){
				logger.info('Transfer result from citi : '+JSON.stringify(result)+'\n\n');
				callback(null,sessionid);
			});
		},*/

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
			    receipt.title = 'You have bought a coffee of '+ config.currency.symbol + ' '+ data.order.total;
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
        callback(err,result);
      }else{
        callback(null,result);    
      }
    });
};

exports.notifyMerchantBuy = function(phoneID,payload,callback){
	console.log('Execute POST notify merchant Buy');
	var order = payload.order;
	var notification = {message:'Purchase validation request', 'phoneID': phoneID };
	async.waterfall([
        //get UserName
		function(callback){
		console.log('Find user --->')
			Userquery.findUserByPhoneID(phoneID,function(err,result){
				console.log(result);
				callback(null,result);
			});
		},
		// disabled purchase
		function(user, callback) {
			var updatePayload = {};
			updatePayload.phoneID = phoneID;
			updatePayload.canPurchase = 'YES';
			Userquery.updateUserPurchaseFlag(updatePayload, function(err,result){
			    if(err){
			      console.log(err);
			      callback('ERROR',err);
			    }else{
			      console.log('Update User correctly');
			      callback(null,user);
				}
			});
		},
		//save Temporal Order
		function(user, callback) {
			order.customerName = user.name;
			order.phoneID = phoneID;
            order.customerImage = config.S3.url + phoneID +'.png',
            order.merchantId = payload.merchantID;
            console.log('Order to persist');
            console.log(order)
            console.log('----------------');
			orderQueryTemporal.saveOrder(order, function(err,result){
				var ID = result.order;
				console.log('Identificador de orden'+ ID);
				logger.info('Order saving result: '+JSON.stringify(result)+'\n\n');
				callback(null, user,ID);
			});

		},
		//send push notification
		function(user,ID,callback) {
            order.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
            order.ID = ID;
			var extraData = { action : 6 , buy : JSON.stringify(order) };
			additionalInfo = extraData.order;
			notification.extra = {extra : extraData} ;
			console.log('Send push'+ JSON.stringify(notification));
			urbanService.singlePush2Merchant(notification, function(err, result) {
				if(err){
					var response = { statusCode:1 ,  additionalInfo : result };
					callback('ERROR',response);
				}else{
					console.log('')
					response = {message : 'Please approach to the merchant for an additional validation.' , canPurchase : 'YES'}
					var response = { statusCode:0 ,  additionalInfo : response };
					callback(null,response);
				}
			});
		},
    ], function (err, result) {
      if(err){
		console.log('Error  --->' + JSON.stringify(result));
        callback(err,result);
      }else{

        callback(null,result);
      }
    });
}

exports.authorizeBuy		 = function(payload,callback){
	console.log('Incoming autorization for  autorization' + JSON.stringify(payload));
	var payloadBuyFlow = {};

	async.waterfall([
		//get Temporal order
		function(callback){
		console.log('Get Temporal Order');
			orderQueryTemporal.getOrder(payload.ID,function(err,result){
				if(err) callback('ERROR',err);
				else{
					console.log(result);
					callback(null,result);
				}
			});
		},

		//enabled flag for purchase
		function(order,callback){
			console.log('Enabled flag for purchase ' + order.phoneID);
			console.log(payload.status);
			var updateQuery  = {};
			updateQuery.phoneID = order.phoneID;
			if(payload.status === 'ACCEPTED'){
				updateQuery.canPurchase = 'YES';
				Userquery.updateUserPurchaseFlag(updateQuery,function (err,result) {
					if(err) callback('ERROR',err);
					else{
						console.log('result Update '+ JSON.stringify(result));
						if(result.ok === 1)
							callback(null,order);
						else{
							var response = { statusCode:1 ,  additionalInfo : 'Error to update flag purchase' };
							callback('ERROR',response);
						}
					}
				});
			}else
				callback(null,order);
		},

		//get session
		function(order,callback){
			if(payload.status === 'ACCEPTED'){
				console.log('Consult sessionid for ' + order.phoneID);
				console.log(order);
				var requestRegenerate = { 'phoneID' : order.phoneID };
				requestRegenerate.sessionid = '';
				loginFlow.regenerate(requestRegenerate,null, function (err,result){
					if(err) callback('ERROR',err);
					else{
						callback(null,order,result);
					}
				});
			}else
				callback(null,order,'');
		},

		//invoke buy flow
		function(order,sessionid,callback){
			if(payload.status === 'ACCEPTED'){
				console.log('Invoke buy flow');
				payloadBuyFlow.order =  order ;
				payloadBuyFlow.sessionid = sessionid;
				payloadBuyFlow.phoneID = order.phoneID;
				purchaseFlow.buyFlow(payloadBuyFlow ,function  (err,result) {
					if(err){
						console.log(err);
						callback('ERROR',err);
					}
					else{
						console.log('Result purchase');
						callback(null,order);
					}
				});
			}else
				callback(null,order);

		},

		//push notification for client
		function(order,callback){
            var message = {};
            var extraData = {};
            var title = 'Purchase validation';
            message.message = title;
            message.phoneID = order.phoneID;

            if(payload.status === 'ACCEPTED')
				extraData = { status : payload.status , message:'Your purchase was approved. Please check your receipts.' , canPurchase :'YES' };

			else
				extraData = { status : payload.status , message:'Your purchase was rejected.' , canPurchase :'YES'};

			message.extra = {extra : extraData} ;
			urbanService.singlePush(message, function(err, result) {
				if(err){
				  var response = { statusCode:1 ,  additionalInfo : result.message };
				  callback('ERROR',response);
				}
				else{
				  var response = { statusCode:0 ,  additionalInfo : result };
				  callback(null, response, result);
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
