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
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

exports.sendMessage = function(payload,callback) {
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
            //message = extraData;
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.MESSAGE;
            message.title = 'You have received message  from ' + senderName;
            message.phoneID = payload.destinatary;
            message.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
            message.message = requestMessage.message;
            message.additionalInfo = JSON.stringify({ name: senderName  , avatar :senderAvatar ,  amount : requestMessage.amount , message : requestMessage.message });
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
                var response = { statusCode: 0, additionalInfo: ' message was sent successful' };
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
