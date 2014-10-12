var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var Userquery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/urban-service');
var doxsService = require('../../services/doxs-service');
var transferFlow = require('./transfer-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var ReceiptQuery = require('../../model/queries/receipt-query');

exports.buyFlow = function(payload,callback) {

	//var transferDoxs = {phoneID:payload.phoneID,amount:200 ,type:3};
	var order = payload.order;
	//var buy = {sessionid:'', target:'buy coffe', type:1, amount:payload.order.total};
	var buy = {sessionid:'', target:'airtime', type:1, amount:5};
	var balance = {sessionid:'',type:1};
    var notification = {message:'There is a new order!', phoneID: payload.phoneID}
	var id;
	var response;
    var forReceipt = {};
    forReceipt.payload = payload;
    console.log('Runing buyFlow!: ' + JSON.stringify(forReceipt) );

	async.waterfall([
		function(callback){
			var requestSoap = { sessionid:payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
			console.log(request);
			soap.createClient(soapurl, function(err, client) {
				client.transfer(request, function(err, result) {
					if(err) {
						console.log(err);
						return new Error(err);
					} else {
						console.log(result);
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
		/*
		function(sessionid,callback){
			console.log('Transfering doxs '+JSON.stringify(transferDoxs));
			transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
				console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
				callback(null,sessionid);
			});
		},*/

		function(sessionid,callback){
			payload['action']="payment";
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
			console.log('Saving order '+JSON.stringify(order));
			Orderquery.putOrder(order, function(err,result){
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
					console.log(result);
					notification.OS = result.OS;
					notification.appID = result.appID;
					console.log(notification);
					callback(null,sessionid);
				}
			});
		},
		function(sessionid,callback) {
			var message = 'There is a new order!';
			notification.message = message;
			var extraData = { action : 3 , order : JSON.stringify(order) };
			notification.extra = {extra : extraData} ;
			console.log(notification);
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
			console.log('balance Points');
			var  request = { sessionid: sessionid, type: 3  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						console.log(response);
						if(response.result  === '0' ) {
							var balance = { current : currentMoney , dox : response.current , order : Math.floor((Math.random() * (1000 - 100) + 100 )) ,  status :'IN PROGRESS' , date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')  } ;
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
			    receipt.title = 'You have buy a coffe of € ' + data.order.total;
			    receipt.amount = data.order.total;
			    receipt.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			    receipt.type = 'BUY';
			    receipt.status = 'IN PROGRESS';
			    console.log(receipt);
			    ReceiptQuery.createReceipt(receipt, function(err, result) {
			        if (err)
			            callback('ERROR', result.message);
			        else{
			            callback(null, response);
			        }
			    });
			
		}
    ], function (err, result) {
      if(err){      
        callback("Error! "+err,result);    
      }else{
        callback(null,result);    
      }
    });
};

