var async = require('async');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var crypto = require('crypto');
var ReceiptQuery = require('../../model/queries/receipt-query');
var PrizeQuery = require('../../model/queries/prize-query');

exports.setCoupon = function(payload,callback) {

	async.waterfall([

		function(callback){

			//save message

			callback(null);

		},


		function(callback){
			
			//send push

			callback(null);

		},

		function(callback){
			PrizeQuery.getPrize(payload.prizeID, function(err, result){
				callback(null, result);
			});
		},

		function(prize, callback){

            console.log( 'Create Receipt Coupon' );
            var receipt = {};
            receipt.emitter = payload.phoneID;
            receipt.receiver = payload.phoneID;
            receipt.amount = "0";
            receipt.message = config.messages.coupon;
            receipt.additionalInfo = prize;
            receipt.title = config.messages.coupon;
            receipt.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            receipt.type = 'COUPON';
            receipt.status = 'DELIVERED';
            ReceiptQuery.createReceipt(receipt, function(err, result) {
                if (err)
                    callback('ERROR', err);
                else
                    callback(null, result);
            });

		},

	], function(err, result) {
	    if (err) 
	        callback(err, result);
	    else
	        callback(null, result);   
	});

}
