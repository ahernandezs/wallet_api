var UserQuery = require('../model/queries/user-query');
var moment = require('moment-timezone');
var async = require('async');
var https = require('https');
var uuid = require('uuid');
var js2xmlparser = require("js2xmlparser");
var async = require('async');
var UserQuery = require('../model/queries/user-query');
var parseString = require('xml2js').parseString;
var Client = require('node-rest-client').Client;


exports.requestLoan = function(payload, callback) {
	    async.waterfall([
        function(callback) {
          console.log('Search countryCode ');
		  UserQuery.findUserByPhoneID(payload.phoneID, function(err,result) {
		  	if(err){      
            	callback('ERROR',result);
	        } else {      
	            callback(null,result.countryCode);
	        }
		  });
        },
        function(countryCode, callback) {
        	console.log('Invoke operation cashcredit for REQUESTLOAN ');
			var dateTime = moment().tz(process.env.TZ).format('DD.MM.YYYY HH:mm:ss').substring(0,19);
			var xmlPayload = {
				SYSTEMID    : 'AMDOCS' ,
				REQUESTID   :  uuid.v1().replace(/-/g,'') ,
				TIMESTAMP   : dateTime ,
				COMMAND     : 'REQUESTLOAN' ,
				PID         :  "+" + countryCode +payload.phoneID,
				MSISDN      :  "+" + countryCode +payload.phoneID, 
				TOTALAMOUNT :  payload.amount,
				INSTNUM     :  payload.installments,
				INSTTYPE    :  payload.typeInstallment,
			};

			console.log(js2xmlparser("DATA", xmlPayload));

			var args = {
				data:  js2xmlparser("DATA", xmlPayload) ,
				headers:{ 'Content-Type': 'text/xml' , 'Accept-Charset' : 'UTF-8' }
			};

			console.log(args);
			var client = new Client();
			client.post('http://212.36.7.118:4444/WSP_1008', args, function(data,response) {
				parseString(data, function (err, result) {
		    		console.log(result);
		    		callback(null,result);
				});
			});
        }
    ], function (err, result) {
        if(err){      
            callback('ERROR',result);
        } else {      
            callback(null,result);
        }
    })
};

exports.requestDecision = function(payload, callback){
	    async.waterfall([
        function(callback) {
          console.log('Search countryCode for requestDecision ');
		  UserQuery.findUserByPhoneID(payload.phoneID, function(err,result) {
		  	if(err){      
            	callback('ERROR',result);
	        } else {      
	            callback(null,result.countryCode);
	        }
		  });
        },
        function(countryCode, callback) {
        	console.log('Invoke operation cashcredit for REQUESTLOAN ');
			var dateTime = moment().tz(process.env.TZ).format('DD.MM.YYYY HH:mm:ss').substring(0,19);;
			var xmlPayload = {
				SYSTEMID    : 'AMDOCS' ,
				REQUESTID   :  uuid.v1().replace(/-/g,'') ,
				TIMESTAMP   : dateTime ,
				COMMAND     : 'REQUESTDECISION' ,
				PID         :  payload.phoneID,
				MSISDN      :  "+" + payload.countryCode + payload.phoneID
			};

			console.log(js2xmlparser("DATA", xmlPayload));

			var args = {
				data:  js2xmlparser("DATA", xmlPayload) ,
				headers:{ 'Content-Type': 'text/xml' , 'Accept-Charset' : 'UTF-8' }
			};

			console.log(args);
			var client = new Client();
			client.post('http://212.36.7.118:4444/WSP_1008', args, function(data,response) {
				parseString(data, function (err, result) {
		    		console.log(result);
		    		callback(null,result);
				});
			});
	    }], function (err, result) {
	        if(err){      
	            callback('ERROR',result);
	        } else {      
	            callback(null,result);
	        }
	    })
};
