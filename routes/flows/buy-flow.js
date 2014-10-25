var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var productQuery = require('../../model/queries/product-query');
var Userquery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/urban-service');
var doxsService = require('../../services/doxs-service');
var transferFlow = require('./transfer-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');

exports.buyFlow = function(payload,callback) {

	//var transferDoxs = {phoneID:payload.phoneID,amount:200 ,type:3};
	var order = payload.order;
	var dateTime;
	//var buy = {sessionid:'', target:'buy coffe', type:1, amount:payload.order.total};
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
			var requestSoap = { sessionid:payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
				soap.createClient(soapurl, function(err, client) {
				client.transfer(request, function(err, result) {
					if(err) {
						console.log(err);
						return new Error(err);
					} else {
						var response = result.transferReturn;
						if(response.result != 0){
							var response = { statusCode:1 ,  additionalInfo : result };
							callback("ERROR", response);
						}
						else{
							//sessionUser.loginFlow({phoneID:payload.phoneID , pin :payload.pin },function(err,result){
							callback(null,payload.sessionid);
						}
					}
				});
			});
		},

		function(sessionid,callback){
			payload['action']='payment';
			doxsService.saveDoxs(payload, function(err, result){
				console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
				if(err) {
					return new Error(err);
				} else {
					callback(null,sessionid);
				}
			});
		},

		function(sessionid, callback){
			var updateDoxs = {phoneID: payload.phoneID, operation: 'payment'};
			console.log('Saving doxs in mongo');
			Userquery.putDoxs(updateDoxs, function(err,result){
				console.log(sessionid);
				callback(null,sessionid);
			});
		},
        
        function(sessionid, callback) {
            console.log('search user by phoneID');
              Userquery.findUserByPhoneID(payload.phoneID,function(err,result){
                if(err){
                    var response = { statusCode:1 ,  additionalInfo : err };
                    callback('ERROR',response);
                  }
                  else{
                    console.log(result);
                    order.customerName = result.name;
                    order.customerImage = config.S3.url + payload.phoneID +'.png',
                    callback(null,sessionid);
                  }
              });  
        },

		function(sessionid,callback){
			console.log('Saving order '+JSON.stringify(order));
			Orderquery.putOrder(order, function(err,result){
				orderID = result.order;
				console.log('Order saving result: '+JSON.stringify(result)+'\n\n');
				callback(null, sessionid);
			});
		},

		function(sessionid,callback){
			console.log('search merchant by phoneID');
			merchantQuery.getMerchanByID(1,function(err,result){
				if(err){
					var response = { statusCode:1 ,  additionalInfo : err };
					callback('ERROR',response);
				}
				else{
					notification.OS = result.OS;
					notification.appID = result.appID;
					callback(null,sessionid);
				}
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
			console.log('balance e-wallet');
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
			console.log('Get product image');
			productQuery.getProduct(payload.order.products[0].name ,function(err,result){
				if(err){
					var response = { statusCode:1 ,  additionalInfo : result };
					callback('ERROR',response);
				}else{
					imageProduct = result.url;
					callback(null,sessionid,currentMoney);
				}
			});
		},

		function(sessionid,currentMoney, callback){
			console.log('balance Points');
			var  request = { sessionid: sessionid, type: 3  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						var twitterMsg = {};
						//twitterMsg = config.messages.twitter1 + payload.order.products[0].name + config.messages.twitter2 + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +'!!!';
						//var twitterMsg = config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
						var twitterMsg = config.messages.twitterMsg;
						config.messages.twitter.message = twitterMsg;
						if(response.result  === '0' ) {
							dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
							var balance = {
								current: currentMoney,
								dox: response.current,
								doxAdded: config.doxs.p2p,
								order: orderID,
								status:'NEW',
								date:dateTime,
								twitter: config.messages.twitter,
								facebook:config.messages.facebook,
								product : imageProduct
							};
							console.log(config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')));
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
			    console.log('Create receipt buy');
			    data = forReceipt.payload;
			    var receipt = {};
			    receipt.emitter = data.phoneID;
			    receipt.receiver = 'merchant';
			    receipt.title = 'You have bought a coffee of € ' + data.order.total;
			    receipt.additionalInfo = JSON.stringify(response.additionalInfo);
			    receipt.amount = data.order.total;
			    receipt.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
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
			console.log( 'Create  transacction money' );
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
					console.log('Error to create transacction');
				else{
					console.log(result);
				}
			});
			console.log( 'Create  transacction DOX' );
			var transacction = {};
			transacction.title = 'Amdocs cafe ';
			transacction.type = 'DOX',
			transacction.date = dateTime;
			transacction.amount = config.doxs.p2p;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'BUY';
			transacction.phoneID = receipt.emitter;
			transacction.description ='Order No '+ orderID;
			transacctionQuery.createTranssaction(transacction, function(err, result) {
				if (err)
					callback('ERROR', err);
				else{
					console.log(result);
					callback(null, balance);
				}
			});
		},

    ], function (err, result) {
      if(err){      
        callback("Error! "+err,result);    
      }else{
        callback(null,result);    
      }
    });
};

