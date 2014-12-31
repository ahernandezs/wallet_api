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
var requestQuery = require('../../model/queries/request-query');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

exports.requestMoneyFlow = function(payload,callback) {
	var requestMessage = payload;
    var dateTime;

	async.waterfall([
		function(callback) {
            console.log(requestMessage);
		    console.log('Get sender in db ' + requestMessage.phoneID);
            Userquery.getName(requestMessage.phoneID,function(err,user){
                if (err) {
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                } else {
                    console.log(config.S3.url);
                    senderAvatar = config.S3.url + payload.phoneID +'.png';
                    callback(null, user.name,senderAvatar);
                }

            });
		},
        
        function(senderName, senderAvatar, callback) {
              console.log('Get receiver in db ' + requestMessage.destinatary);
            Userquery.getName(requestMessage.destinatary,function(err,user){
                if (err) {
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                } else {
                    console.log(config.S3.url);
                    callback(null, user.name, senderName, senderAvatar);
                }

            });
        },
        
        function (receiverName, senderName, senderAvatar, callback)
        {
            console.log('Save requestMoney in DB');
            var requestMsg = 'You have sent a money transfer request to ' + receiverName;
            dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var data = { sender : payload.phoneID, destinatary : payload.destinatary, amount : payload.amount,
                            message : requestMsg, status : config.requests.status.NEW , date : dateTime};
            requestQuery.createRequest(data, function(err, result) {
                if (err)
                    callback('ERROR', { statusCode : 1, additionalInfo : 'The request could not be sent.' });
                else
                    callback(null, senderName, senderAvatar, result);
            });
        },
        
		function(senderName, senderAvatar, requestID, callback) {
            console.log('Save message in DB');
            var message = {};
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.REQUEST_MONEY;
            message.title = 'You have received a money transfer request from ' + senderName;
            message.phoneID = payload.destinatary;
            message.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            message.message = requestMessage.message;
            message.additionalInfo = JSON.stringify({phoneID:payload.phoneID, name: senderName, avatar :senderAvatar,  amount : requestMessage.amount, message : requestMessage.message, requestID : requestID  });
            messageQuery.createMessage(requestMessage.phoneID, message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.message = message.title;
                    payload.phoneID = payload.destinatary;
                    var extraData = {   action: 6, additionalInfo :  message.additionalInfo ,
                                    _id:result._id };
                    payload.extra = { extra:extraData};
                    callback(null, payload,requestID);
                }
            });
        },
        
        function(message,requestID, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: { msg:'request-money message was sent successful', 'requestID' : requestID , 'dateTime' : dateTime}};
                callback(null,response);
            });
        }

		], function (err, result) {
			if(err){
				console.log('Error  --->' + JSON.stringify(result));
				callback("Error! "+err,result);
			}else{
				callback(null,result);
			}
		});
};

exports.resolveRequestFlow = function(payload, header, callback) {
    console.log( payload );
    var accepted = ( payload.answer === config.requests.status.ACCEPTED ) ? true : false;
    var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        async.waterfall([
           function(callback) {
               console.log('Get sender in db ' + payload.phoneID);
                Userquery.getName(payload.phoneID,function(err,user) {
                    if (err) {
                        var response = { statusCode: 1, additionalInfo: err };
                        callback('ERROR', response);
                    } else {
                        console.log(config.S3.url);
                        senderAvatar = config.S3.url + payload.phoneID +'.png';
                        callback(null, user.name, senderAvatar);
                    }

                });
           },
            function(username, avatar, callback) {
                console.log( 'Getting requestMoney from Mongo' );
                requestQuery.getSingleRequest(payload.requestID, function(err, result) {
                    if (err)
                        callback('ERROR', 'There was an error sending the answer.');
                    else {
                        var request = result;
                        request.status = payload.answer;
                        request.date = dateTime;
                        callback(null, request, username, avatar);
                    }
                });
            },
            function(request, username, avatar, callback) {
                console.log( 'Update requestMoney' );
                console.log(request);
                requestQuery.updateRequest(request, function(err, result) {
                   if (err)
                       callback('ERROR', 'There was an error sending the answer.' );
                    else
                        callback(null, username, avatar, request.amount);
                });
            },
            function(username, avatar, amount, callback) {
                if (!accepted)
                    callback(null, null, username, avatar);
                else {
                    console.log( 'Making transferFunds' );
                    var values = {};
                    values.body = { destiny : payload.destinatary, message : payload.message, amount : amount };
                    values.header = header;
                    transferFlow.transferFunds(values, function(err, result) {
                        if (err)
                            callback('ERROR', 'There was an error making the transfer.');
                        else {
                            delete result.sessionid;
                            callback(null, result, username, avatar);
                        }
                    });
                }
            },
            function(balance, username, avatar, callback) {
                var message = {};
                message.title = 'Your money request to ' + username + ' was ' + payload.answer;
                var messageID;
                
                if(!accepted) {
                    console.log('Save message in DB');
                    message.status = config.messages.status.NOTREAD;
                    message.type = config.messages.type.MESSAGE;
                    message.phoneID = payload.destinitary;
                    message.date = dateTime;
                    message.message = payload.message;
                    
                    messageQuery.createMessage(message.phoneID, message, function(err, result) {
                        if (err) {
                            var response = { statusCode: 1, additionalInfo: result };
                            callback('ERROR', response);
                        } else
                            messageID = result._id;
                    });   
                }
                payload.phoneID = payload.destinatary;
                payload.message = message.title;
                var extraData = {   action: 6, additionalInfo : message.additionalInfo, _id : messageID };
                payload.extra = { extra:extraData };
                callback(null, payload, balance);
            },
            function(pushData, balance, callback) {
                console.log( 'send push notification.' );
               urbanService.singlePush(pushData, function(err, result) {
                   if (!accepted)
                       callback(null, 'The answer was sent correctly.'); 
                   else
                       callback(null, balance);
               });
            }
        ],
        function (err, result) {
            if (err) {
                console.log('Error  --->' + JSON.stringify(result));
                callback("Error! " + err, result);    
            } else {
                callback(null,result);    
            }
        });
};
