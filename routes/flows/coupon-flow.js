var async = require('async');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var crypto = require('crypto');


exports.setCoupon = function(payload,callback) {

	async.waterfall([

		function(callback){

			//send push

			callback(null);

		},


		function(callback){
			
			//save message

			callback(null);

		},

		function(sessionid, callback){

			//generate receipt

			callback(null, result);

		},

	], function(err, result) {
	    if (err) 
	        callback(err, result);
	    else
	        callback(null, result);   
	});

}
