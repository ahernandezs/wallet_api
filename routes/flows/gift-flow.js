var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/urban-service');
var doxsService = require('../../services/doxs-service');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transferFlow = require('./transfer-flow');
var transacctionQuery = require('../../model/queries/transacction-query');
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

	async.waterfall([

		function(callback){
			var payloadBody= payload.body;
			forReceipt.payload = payloadBody;
			Userquery.getName(payload.phoneID, function(err, resp) {
				name = resp;
				callback(null);
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
							var balance = { current : currentMoney , dox : response.current , doxAdded:config.doxs.gift,  order : orderID ,  status :'IN PROGRESS' , date: dateTime } ;
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
					callback(null,response);
				}
			});
		},

		function(response,callback) {
			console.log('sending push');
			var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			var additionalInfo = JSON.stringify({ phoneID: payload.phoneID, name: name.name, avatar: config.S3.url + payload.phoneID +'.png',date:dateTime,message:payload.message});
			console.log(additionalInfo);
			var title = 'You have received a coffee gift!';
			var emitter = payload.phoneID;
			var receiver = payload.beneficiaryPhoneID;
			var message = payload.message;
			payload.message = title;
			var extraData = { action :2,additionalInfo:JSON.stringify(additionalInfo)};
			payload.extra = {extra : extraData} ;
			payload.phoneID = payload.beneficiaryPhoneID;
			delete payload.beneficiaryPhoneID;
			console.log(payload);
			urbanService.singlePush(payload, function(err, result) {
				console.log('Pushing result: '+JSON.stringify(result));
				callback(null,response,payload,emitter,receiver,message,additionalInfo);
			});
		},

		function(balance,payload,emitter,receiver,message,additionalInfo,callback) {
			console.log( 'Create Receipt Gift' + message);
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
			console.log(receipt);
			ReceiptQuery.createReceipt(receipt, function(err, result) {
				if (err)
					callback('ERROR', err);
				else
					callback(null, balance,receipt);
			});
		},

		function(balance,receipt, callback) {
			console.log( 'Create  transacction Money' );
			var receiver;
			var transacction = {};
			transacction.title = 'GIFT';
			transacction.type = 'MONEY',
			transacction.date = dateTime;
			transacction.amount = (-1) * receipt.amount;
			transacction.additionalInfo = receipt.additionalInfo;
			transacction.operation = 'GIFT';
			transacction.phoneID = receipt.emitter;
			Userquery.findAppID(receipt.receiver,function(err,result){
				transacction.description ='To ' + result.name;
				receiver = result.name;
				transacctionQuery.createTranssaction(transacction, function(err, result) {
					if (err)
						console.log('Error to create transacction');
					else{
						console.log( 'Create  transacction DOX' );
						var transacction = {};
						transacction.title = 'GIFT';
						transacction.type = 'DOX',
						transacction.date = dateTime;
						transacction.amount = config.doxs.gift;
						transacction.additionalInfo = receipt.additionalInfo;
						transacction.operation = 'GIFT';
						transacction.phoneID = receipt.emitter;
						transacction.description ='To ' + receiver;
						transacctionQuery.createTranssaction(transacction, function(err, result) {
							if (err)
								callback('ERROR', err);
							else{
								console.log(result);
								callback(null, balance);
							}
						});
					}
				});
			});
		},

		], function (err, result) {
			if(err){
				callback("Error! "+err,result);
			}else{
				callback(null,result);
			}
		});
}
