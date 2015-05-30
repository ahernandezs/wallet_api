var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var moment = require('moment-timezone');
var Orderquery = require('../../model/queries/order-query');
var productQuery = require('../../model/queries/product-query');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/notification-service');
var doxsService = require('../../services/doxs-service');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transferFlow = require('./transfer-flow');
var transacctionQuery = require('../../model/queries/transacction-query');
var messageQuery = require('../../model/queries/message-query');
var sessionQuery = require('../../model/queries/session-query')
var balance_Flow = require('./balance-flow');
var soapurl = process.env.SOAP_URL;
var soapurlNew = process.env.SOAP_URL_NEW;
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
    var responseBalance ={};

	async.waterfall([


		  function(callback) {
            Userquery.findUserGifts(payload.phoneID, function(err,transfers){
                if(err){
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                }
                else
                    callback(null);
            });
        },

		function(callback){
			dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
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
	      console.log('Get credentials .........'+payload.sessionid);
	      var requestSession = { 'sessionid' :  payload.sessionid };
	      sessionQuery.getCredentials(requestSession,function(err,user){
	         if(err) {
	            console.log('Error to get credentials ' )
	            console.log(user);
	            callback(null,user.data);
	          } else {
	            console.log('Obteniendo usuarios');
	            console.log(user);
	            callback(null,user)
	          }
	      });
	    },

		function(user,callback){
			console.log('Transfer purchase to merchant');
			var paymentRequest = {  amount :  payload.order.total ,to: config.username, description:'buy product' };
			console.log(paymentRequest);

			if(payload.order.total === 0){
				var response = { statusCode:1 ,  additionalInfo : 'Invalid amount' };
				callback("ERROR", response);
			}
			else{
				soap.createClient(soapurlNew, function(err, client) {
				client.setSecurity(new soap.WSSecurity( user.phoneID,user.pin,'PasswordDigest'));
				client.Payment(paymentRequest, function(err, result) {
						if(err) {
							if(err.body.indexOf('successful')  >= 0 )
								callback(null,payload.sessionid);
							else{
								console.log(err);
								var response = { statusCode:1 ,  additionalInfo : 'Error while performing payment' };
								callback("ERROR", response);
							}

						} else {
							console.log(result);
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
			}
		},

        function(sessionid, callback) {
            console.log('search user by phoneID');
              Userquery.findUserByPhoneID(receiver,function(err,result){
                if(err){
                    var response = { statusCode:1 ,  additionalInfo : err };
                    callback('ERROR',response);
                  }
                  else{
                    console.log(result);
                    order.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
                    order.customerName = result.name;
                    order.customerImage = config.S3.url + receiver +'.png',
                    order.merchantId = payload.merchantID;
                    callback(null,sessionid);
                  }
              });  
        },
		function(sessionid, callback){
				Orderquery.putOrder(order, function(err,result){
				orderID = result.order;
				console.log('Order saving result: ');
				callback(null,sessionid);
			});
		},

		function(sessionid, callback){
			doxsService.saveDoxs(payloadoxs, function(err, result){
				console.log('Transfer result ');
				if(err) {
					return new Error(err);
				} else {
					callback(null, sessionid);
				}
			});
		},

		        //Get balance using old version
        function(sessionid,callback){
			balance_Flow.balanceFlow(sessionid,function(err,result){
				if(err)
					var response = { statusCode:1 ,  additionalInfo : err };
				else{
					console.log('Result balance');
					console.log(result);
					dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
					var balance = { current : result.additionalInfo.current , dox : result.additionalInfo.dox , doxAdded:config.doxs.gift,  order : orderID ,  status :'NEW' , date: dateTime } ;
					responseBalance = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : balance };

					callback(null,sessionid);
				}
			});
        },

		function(sessionid, callback){
			var updateDoxs = {phoneID: payload.phoneID, operation: 'gift', sessionid:payload.sessionid};
			console.log('Saving doxs in mongo');
			Userquery.putDoxs(updateDoxs, function(err,result){
				callback(null,sessionid);
			});
		},

        function(sessionid, callback){
            Userquery.getIdByPhoneID(payload.phoneID,function(err,result){
                var id = result._id;
                callback(null,sessionid);
            });
        },
        function(sessionid, callback){
            console.log('Save message in DB');
            var title = config.messages.giftMsg;
            title = title.replace('[sender]', name.name);
            var extraData = { action :1, giftID: orderID , additionalInfo: payload.additionalInfo };
            payload.extra = {extra : extraData} ;
            payload.status = config.messages.status.NOTREAD;
            payload.type = config.messages.type.GIFT;
            payload.title = title;
            payload.date = dateTime;

			var fbinfo = config.messages.facebook;
			fbinfo.picture = imageProduct;

            //var twitterMsg = config.messages.twitter.message.replace('{0}',payload.order.products[0].name).replace('{1}',new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0,19););
			var twitterMsg = config.messages.twitterMsg + dateTime.substr(11, 5);
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
											facebook: fbinfo,
											twitter:config.messages.twitter,
										});

            var payloadMessage = payload;
            payloadMessage.phoneID = payload.beneficiaryPhoneID;

            messageQuery.createMessage(emitter,payloadMessage, function(err, result) {
                if (err) {
                    callback('ERROR', { statusCode: 1, additionalInfo: result });
                } else {
                    callback(null, result._id);
                }
            });
        },
		function(messageID,callback) {
			console.log('sending push');
			//var additionalInfo = { phoneID: payload.phoneID, name: name.name, avatar: config.S3.url + payload.phoneID +'.png', order:orderID, date:dateTime,message:payload.message};
			//console.log(additionalInfo);
			var title = config.messages.giftMsg;
            title = title.replace('[sender]', name.name);
			var message = payload.message;
			payload.message = title;
			var extraData = { action :2,additionalInfo:payload.additionalInfo,_id:messageID};
			payload.extra = {extra : extraData} ;
			payload.phoneID = payload.beneficiaryPhoneID;
			delete payload.beneficiaryPhoneID;
			urbanService.singlePush(payload, function(err, result) {
				callback(null,payload,emitter,receiver,message,payload.additionalInfo);
			});
		},
		function(payload,emitter,receiver,message,additionalInfo,callback) {
			console.log( 'Create Receipt Gift for sender ');
			var receipt = {};
			receipt.emitter = emitter;
			receipt.receiver = receiver;
			receipt.amount = payload.order.total;
			receipt.message = message;
			receipt.additionalInfo = additionalInfo;
			receipt.title = " You have gifted a coffee";
			receipt.date = dateTime;
			receipt.type = 'GIFT';
			receipt.status = 'NEW';
		        receipt.owner = 1;
			ReceiptQuery.createReceipt(receipt, function(err, result) {
				if (err)
					callback('ERROR', err);
				else
					callback(null,receipt, message, additionalInfo);
			});
		},
        function( receipt, message, additionalInfo, callback) {
            console.log( 'Create second receipt, this one for the receiver' );
            var title = config.messages.giftMsg;
            title = title.replace('[sender]', name.name);
            var newReceipt = {};
            newReceipt.emitter = receiver;
            newReceipt.receiver = emitter;
            newReceipt.amount = payload.order.total;
            newReceipt.message = message;
            newReceipt.orderID = orderID;
            var temp = JSON.parse(additionalInfo);
            delete temp.doxAdded;
            newReceipt.additionalInfo = JSON.stringify(temp);
            newReceipt.title = title;
            newReceipt.date = dateTime;
            newReceipt.type = 'GIFT';
            newReceipt.status = 'NEW';
            newReceipt.owner = 0;
            ReceiptQuery.createReceipt(newReceipt, function(err, result) {
               if (err)
                   callback('ERROR', errr);
                else
                    callback(null, receipt);
            });
        },
		function(receipt, callback) {
			console.log( 'Create  transacction Money' );
			console.log(responseBalance);
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
								var balance = responseBalance;
								balance.date = dateTime;
                                balance.type = 'GIFT';
                                balance._id = orderID;
                                balance.additionalInfo.avatar = config.S3.url + emitter +'.png';
                                balance.additionalInfo.name = receiver;
                                balance.additionalInfo.amount = receipt.amount;
                                balance.title = 'You have sent a gift';
                                balance.additionalInfo.product = payload.order.products[0].name;
								callback(null, balance);
							}
						});
					}
				});
			});
		}
		], function (err, result) {
			if(err){
				callback(err,result);
			}else{
				callback(null,result);
			}
		});
}
