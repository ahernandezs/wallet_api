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

	async.waterfall([
		function(callback) {
            console.log('Imprimiendo');
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
            var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
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
            message.additionalInfo = JSON.stringify({phoneID:payload.phoneID, name: senderName, avatar :senderAvatar,  amount : requestMessage.amount, message : requestMessage.message, requestID : requestID });
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
                    callback(null, payload);
                }
            });
        },
        
        function(message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'request-money message was sent successful' };
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

exports.requestMoneyConfirm = function(payload,callback) {
    var requestMessage = payload;

    async.waterfall([
        function(callback) {
            console.log('Imprimiendo');
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
        function(senderName,senderAvatar,callback){
            console.log('Save message in DB');
            var message = {};
            var title = config.messages.transferMsg + senderName;
            //message = extraData;
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.REQUEST_MONEY;
            message.title = 'You have received money a money transfer request from' + senderName;
            message.phoneID = payload.phoneID;
            message.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            message.message = requestMessage.message;
            message.additionalInfo = JSON.stringify({name: senderName  , avatar :senderAvatar ,  amount : requestMessage.amount , message : requestMessage.message });
            messageQuery.createMessage(requestMessage.phoneID,message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.phoneID = payload.destinitary;
                    payload.message = title;
                    var extraData = {   action: 6, additionalInfo :  message.additionalInfo ,
                                    _id:result._id };
                    payload.extra = { extra:extraData};
                    callback(null, payload);
                }
            });
        },

        function(message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'request-money message was sent successful' };
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

exports.resolveRequestFlow = function(payload, callback) {
    console.log( payload );
    var accepted = ( payload.answer === config.requests.status.ACCEPTED ) ? true : false;
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
                if ( !accepted )
                    callback(username, avatar, callback);
                else {
                    console.log( 'Getting requestMoney from Mongo' );
                    requestQuery.getSingleRequest(payload.requestID, function(err, result) {
                        if (err)
                            callback('ERROR', 'There was an error sending the answer.');
                        else {
                            var request = result;
                            request.status = payload.answer;
                            request.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                            callback(null, request, username, avatar);
                        }
                    });
                }
            },
            function(request, username, avatar, callback) {
                console.log( 'Update requestMoney' );
                console.log(request);
                requestQuery.updateRequest(request, function(err, result) {
                    console.log(result);
                   if (err)
                       callback('ERROR', 'There was an error sending the answer.' );
                    else
                        callback(null, username, avatar);
                });
            },
            function(username, avatar, callback) {
                if (!accepted)
                    callback(null, username, avatar);
                else {
                    console.log( 'Making transferFunds' );   
                }
            },
            function(username, avatar, callback) {
                /*console.log('Save message in DB');
                var message = {};
                message.status = config.messages.status.NOTREAD;
                message.type = config.messages.type.REQUEST_MONEY;
                message.title = 'Your money transfer request ' + username + ' has been ' + payload.answer;
                message.phoneID = payload.destinitary;
                message.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                message.message = payload.message;
                message.additionalInfo = JSON.stringify({ phoneID: payload.phoneID, name: username, avatar: avatar, message: payload.message });
                messageQuery.createMessage(message.phoneID, message, function(err, result) {
                    if (err) {
                        var response = { statusCode: 1, additionalInfo: result };
                        callback('ERROR', response);
                    } else {
                        payload.phoneID = payload.destinatary;
                        payload.message = message.title;
                        var extraData = {   action: 6, additionalInfo :  message.additionalInfo, _id:result._id };
                        payload.extra = { extra:extraData};
                        callback(null, payload);
                    }
                });*/
            },
            function(callback) {
                console.log( 'send push notification.' );
               /*urbanService.singlePush(, function(err, result) {
                    callback(null, { statusCode : 0, additionalInfo: 'The answer was sent correctly.' }); 
               });*/
            },
            function(callback) {
                if (!accepted)
                    callback(null, { statusCode : 0, additionalInfo : 'The answer was sent corrrectly.' });
                else {
                    console.log( 'Getting balance' );
                }
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
