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
		function(senderName,senderAvatar,callback){
            console.log('Save message in DB');
            var message = {};
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.REQUEST_MONEY;
            message.title = 'You have received transfer request from ' + senderName;
            message.phoneID = payload.destinatary;
            message.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            message.message = requestMessage.message;
            message.additionalInfo = JSON.stringify({phoneID:payload.phoneID , name: senderName  , avatar :senderAvatar ,  amount : requestMessage.amount , message : requestMessage.message });
            messageQuery.createMessage(requestMessage.phoneID,message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.phoneID = payload.destinatary;
                    payload.message = message.title;
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
}


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
}
