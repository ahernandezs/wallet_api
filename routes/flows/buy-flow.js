var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var moment = require('moment-timezone');
var Orderquery = require('../../model/queries/order-query');
var orderQueryTemporal = require('../../model/queries/orderTemporal-query');
var shopOrderQuery = require('../../model/queries/shopOrder-query');
var productQuery = require('../../model/queries/product-query');
var productMobileQuery = require('../../model/queries/mobileProduct-query');
var Userquery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var sessionQuery = require('../../model/queries/session-query')
var urbanService = require('../../services/notification-service');
var doxsService = require('../../services/doxs-service');
var mobileProductTransaction = require('../../model/mobileProductTransaction');
var transferFlow = require('./transfer-flow');
var purchaseFlow = require('./buy-flow');
var loginFlow = require('./login-flow');
var soapurl = process.env.SOAP_URL;
var buyFlow = require('./buy-flow');
var config = require('../../config.js');
var logger = config.logger;
var ReceiptQuery = require('../../model/queries/receipt-query');
var messageQuery = require('../../model/queries/message-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var citiService = require('../../services/citi-service');

Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};

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

		//Create a new message
		function(balance, receipt, callback){
			var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
			var message = {};
			message.phoneID = receipt.emitter;
			message.title = 'Your order No ' + orderID +  ' is ' + config.orders.status.NEW;
			message.type = config.messages.type.BUY;
			message.status = 'NOTREAD';
			var additionalInfoJSON = JSON.parse(receipt.additionalInfo);
			additionalInfoJSON.status = config.orders.status.NEW;
			message.additionalInfo =  JSON.stringify(additionalInfoJSON);
			message.date = dateTime;
			message.message = 'Your order No ' + orderID +  ' is ' + config.orders.status.NEW;
			message.orderID = orderID;
			messageQuery.createMessage(message.phoneID,message, function(err, result) {
				if (err) {
					var response = { statusCode: 1, additionalInfo: err };
					callback('ERROR', response);
				} else {
					callback(null, balance,receipt);
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
            order.status = 'PENDING';
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

exports.authorizeBuy = function(payload,callback){
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
				order.status = 'NEW';
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


exports.sendBuy2Customer  = function(order, callback){
		console.log(order);

		verify_shop_rules(order, function(verified, message){
			if (verified){
				async.waterfall([
					//save temporal order
					function(callback){
						shopOrderQuery.putOrder(order, function(err, result) {
							if(err){
								var response = { statusCode:1 ,  additionalInfo : err };
								callback('ERROR',response);
							}
							else{
								console.log('Save mobile shop order' + result.order);
								callback(null,result.order);
							}
						});
					},

					//Get customer code
					function(orderID, callback){
						console.log('Get customer code' + order.products);
						console.log(order.products[0].productID);
						productMobileQuery.getMobileProduct(order.products[0].productID, function(err,result) {
							if(err){
								var response = { statusCode:1 ,  additionalInfo : err };
								callback('ERROR',response);
							}
							else{
								console.log('Senfbuy"Cusrtomer')
								console.log(result);
								console.log('Get customer code for products' + result.customerCode);
								callback(null, orderID, result.customerCode);
							}
						});
					},

					//send push notification
					function(orderID,customerCode,callback){
						var message = {};
						var extraData = {};
						var title = 'Authorization Purchase';
						message.message = title;
						message.phoneID = order.customerID;
						if(order.status === 'NEW')
							extraData = { action : config.messages.action.MOBILE_SHOP_PURCHASE , total : order.total , totalDox:order.totalDox , orderID: orderID , 'customerCode' : customerCode };

						message.extra = {extra : extraData} ;
						urbanService.singlePush(message, function(err, result) {
							if(err){
								var response = { statusCode:1 ,  additionalInfo : result.message };
								callback('ERROR',response);
							}
							else{
								var response = { statusCode:0 ,  additionalInfo : 'Operation was sucessful' };
								callback(null,response, extraData);
							}
						})

					},
					function(response,extraData,callback){
						logger.info('4.- SAVE MESSAGE IN MONGO');
						var message = {};
						var additionalInfo = {};
						var title = 'Authorization Purchase';
						//message = extraData;
						message.status = config.messages.status.NOTREAD;
						message.type = config.messages.type.MOBILESHOP;
						message.title = title;
						message.phoneID = order.customerID;
						message.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
						message.message = title;
						additionalInfo.total = extraData.total ;
						additionalInfo.totalDox = extraData.totalDox ;
						additionalInfo.customerCode = extraData.customerCode;
						additionalInfo.orderID = extraData.orderID;
						message.additionalInfo = JSON.stringify(additionalInfo);
						messageQuery.createMessage(order.customerID,message, function(err, result) {
							if (err) {
								var resp = { statusCode: 1, additionalInfo: result };
								callback('ERROR', resp);
							} else {
								callback(null, response);
							}
						});
					},
				], function(err, result) {
					if (err)
						callback(err, result);
					else{
						console.log('Finish callback');
						callback(null, result);
					}
				});
			} else {
				callback(true,{statusCode:1, additionalInfo: message});
			}
		});
}

exports.authorizeShopMobileBuy = function(payload,callback){
var sessionid = payload.sessionid;
var payloadBuyFlow = {};
async.waterfall([
		//update order
		function(callback){
			console.log('Get Temporal Order');
			console.log(payload);
			shopOrderQuery.getOrder(payload.orderID ,function  (err,result) {
				if(err){
					console.log(err);
					callback('ERROR',err);
				}
				else{
					console.log(result);
					callback(null,result);
				}
			});
		},
		//invoke buy flow
		function(order,callback){
			if(payload.status === 'ACCEPTED'){
				console.log('Invoke buy flow');
				order.status = payload.status;
				payloadBuyFlow.order =  order ;
				payloadBuyFlow.sessionid = sessionid;
				payloadBuyFlow.phoneID = order.customerID;
				purchaseFlow.buyFlowMobileShop(payloadBuyFlow ,function  (err,result) {
					if(err){
						console.log(err);
						callback('ERROR',err);
					}
					else{
						console.log('Result purchase');
						callback(null,result);
					}
				});
			}else
				callback(null,{statusCode: 0 , additionalInfo: "Operation was sucessful" });

		}
    ], function (err, result) {
      if(err){
        callback(err,result);
      }else{
        callback(null,result);
      }
    });
}

exports.buyFlowMobileShop = function(payload,callback) {
	var dateTime;
	var balance = {sessionid:'',type:1};
	var orderID;
	var response;
    var forReceipt = {};
    var additionalInfo;
    var imageProduct;
    forReceipt.payload = payload;

	async.waterfall([
		//Transfer
		//Update order
		function(callback){
			logger.info('Saving order ');
			shopOrderQuery.update(payload.order.orderID, payload.order.status,  function(err,result){
				orderID = result.order;
				logger.info('Order updated result: '+JSON.stringify(result)+'\n\n');
				callback(null, payload.sessionid);
			});
		},
		function(sessionid,callback){
			console.log('Transfer purchase to merchant');
			if(payload.order.total == 0)
				callback(null,sessionid);
			var requestSoap = { sessionid: sessionid, to: config.username, amount : payload.order.total , type: 1 };
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
							callback(null,sessionid);
						}
					}
				});
			});
		},
		function(sessionid,callback){
			console.log('Discount DOX for purchase');
			if(payload.order.totalDox){
				var requestSoap = { sessionid: sessionid, to: config.username, amount : payload.order.totalDox , type: 3 };
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
								callback(null,sessionid);
							}
						}
					});
				});
			}else
				callback(null,sessionid);
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
							};
							logger.info(config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0,19)));
							response = { statusCode:0 ,  additionalInfo : balance };
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
			    receipt.title = 'You have bought a mobile products of '+ config.currency.symbol + ' '+ data.order.total;
			    receipt.additionalInfo = JSON.stringify(response.additionalInfo);
			    receipt.amount = data.order.total;
			    receipt.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
			    receipt.type = 'BUY-PRODUCT';
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
			transacction.title = 'Amdocs mobile shop ';
			transacction.type = 'MONEY',
			transacction.date = dateTime;
			transacction.amount = (-1) * receipt.amount;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'BUY-PRODUCT';
			transacction.phoneID = receipt.emitter;
			transacction.description ='Order No '+ orderID;
			transacctionQuery.createTranssaction(transacction, function(err, result) {
				if (err)
					logger.error('Error to create transacction');
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

/*
 {
 "customerID": "5530368070",
 "products": [
 {
 "productID": 1,
 "quantity": 1,
 "cost": 5
 } ,           {
 "productID": 2,
 "quantity": 1,
 "cost": "10"
 }
 ],
 "total": 15,
 "totalDox" : 2000,
 "status": "NEW"
 }*/

function verify_shop_rules(order, callback){

	mobileProductTransaction.find({phoneID:order.customerID},function(err,transactions){

		var prods = [];
		for (var i = 0; i < order.products.length; i++)
			prods.push(order.products[i].productID);

		var transDoc = {
			    phoneID: order.customerID,
				productID: prods,
				dateTime: moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19),
				status: config.orders.status.NEW,
				total : [{type:"1", amount: order.total}]
		};
		console.log(transDoc);
		var transaction = new mobileProductTransaction(transDoc);

		if (prods.contains(config.products.loyalty.productId))
			if (order.totalDox < config.products.loyalty.cost) {
				logger.error('LOYALTY PRODUCT CAN BE ONLY PURCHASED WITH DOXPOINTS');
				callback(false, 'LOYALTY PRODUCT CAN BE ONLY PURCHASED WITH DOXPOINTS')
				return;
			}

		if (err)
			handleError(err);
		if (order.products.length > config.products.max_items_per_transaction) {
			logger.error('MAX ITEMS PER TRANSACTION EXCEDED');
			callback(false,'MAX ITEMS PER TRANSACTION EXCEDED');
			return;
		}
		if (order.total > config.products.max_amount_per_person) {
			logger.error('MAX AMOUNT PER PERSON EXCEDED');
			callback(false,'MAX AMOUNT PER PERSON EXCEDED');
			return;
		}

		logger.info('--------OBJECT FOR TRANSACTION-----------------');
		console.log(transaction);
		logger.info('-------------------------');

		if (transactions.length == 0) {
			transaction.save(function(err){
				if (!err) {
					logger.info('RULES SUCCESS!!');
					callback(true,'RULES SUCCESS!!');
					return;
				}
				else {
					logger.error('ERROR IN MONGODB!!!');
					console.log(err);
					callback(false,'ERROR IN MONGODB!!!');
					return;
				}
			});
		} else {
			//Not exced total amount
			var totalpp = 0;
			var tmp = 0;
			var purchased_products = [];
			for (var i = 0; i < transactions.length; i++){
				tmp = transactions[i].total[0].type == 1
					? transactions[i].total[0].amount
					: transactions[i].total[1].amount;
				for (var j = 0; j < transactions[i].productID.length; j++)
					purchased_products.push(transactions[i].productID[j]);
				totalpp = totalpp + tmp;
			}
			console.log("---------------TOTAL PRICE PRODUCTS--------------------------");
			console.log(totalpp);
			console.log("---------------------------------------------");

			console.log("---------------PURCHASED PRODUCTS ID-------------------------");
			console.log(purchased_products);
			console.log("---------------------------------------------");

			if (purchased_products.length > config.products.max_items_per_event) {
				logger.error('MAX ITEMS PER EVENT EXCEDED');
				callback(false,'MAX ITEMS PER EVENT EXCEDED');
				return;
			}

			if (totalpp + order.total > config.products.max_amount_per_person) {
				logger.error('MAX AMOUNT PER PERSON EXCEDED');
				callback(false,'MAX AMOUNT PER PERSON EXCEDED');
				return;
			}

			//Only 1 pz for the same product
			for (var i = 0; i < order.products.length; i++){
				console.log(order.products[i].productID);
				if(purchased_products.contains(order.products[i].productID)) {
					logger.error('YOU CAN NOT BUY THE SAME PRODUCT TWICE');
					callback(false,'YOU CAN NOT BUY THE SAME PRODUCT TWICE');
					return;
				}
			}

			transaction.save(function(err){
				if (!err) {
					logger.info('RULES SUCCESS!!');
					callback(true,'RULES SUCCESS!!');
					return;
				}
				else {
					logger.error('ERROR IN MONGODB!!!');
					console.log(err);
					callback(false,'ERROR IN MONGODB!!!');
					return;
				}
			});
		}
	});
}

