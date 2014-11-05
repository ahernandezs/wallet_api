var async = require('async');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var crypto = require('crypto');
var ReceiptQuery = require('../../model/queries/receipt-query');
var PrizeQuery = require('../../model/queries/prize-query');
var messageQuery = require('../../model/queries/message-query');
var urbanService = require('../../services/urban-service');

exports.setCoupon = function(payload,callback) {

    var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var prize = {};

	async.waterfall([

		function(callback){
			PrizeQuery.getPrize(payload.prizeID, function(err, result){
				prize = result;
				callback(null);
			});
		},

		function(callback){

            var message = {};
            message.status = 'NOTREAD';
            message.type = 'COUPON';
            message.title = config.messages.coupon.title;
            message.message = config.messages.coupon.message;
            message.phoneID = payload.phoneID;
            message.date = dateTime;

            regalo = JSON.parse(JSON.stringify(prize));
            regalo.message = config.messages.coupon.message;

            message.additionalInfo = JSON.stringify(regalo);

            messageQuery.createMessage(payload.phoneID, message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
					var extraData = { action: 5, additionalInfo: JSON.stringify(regalo), _id: result._id };
					payload.extra = { extra:extraData};
		            payload.message = config.messages.coupon.message;
                    payload.title = config.messages.coupon;
                    callback(null,payload);
                }
            });
		},

        function(message, callback) {
            urbanService.singlePush(message, function(err, result) {
                callback(null);
            });
        },

		function(callback){

            var receipt = {};
            receipt.emitter = payload.phoneID;
            receipt.receiver = payload.phoneID;
            receipt.amount = "0";
            receipt.message = config.messages.coupon.message;

            regalo = JSON.parse(JSON.stringify(prize));
            regalo.message = config.messages.coupon.message;

            receipt.additionalInfo = JSON.stringify(regalo);
            receipt.title = config.messages.coupon.title;
            receipt.date = dateTime;
            receipt.type = 'COUPON';
            receipt.status = 'DELIVERED';
            ReceiptQuery.createReceipt(receipt, function(err, result) {
                if (err)
                    callback('ERROR', err);
                else
					var response = { statusCode: 0, additionalInfo: 'The coupon was succesfully sent' };
                    callback(null, response);
            });

		},

	], function(err, result) {
	    if (err) 
	        callback(err, result);
	    else
	        callback(null, result);   
	});

}
