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
var doxsService = require('./doxs-service');


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
					if(result.RESULT.CODE[0] === '0' ){
						console.log('result information ' + 'OK');
						callback(null,result);
					}else{
						console.log('result information ' + 'Unknown error');
						callback(null,payload.sessionid, result);
					}
				});
			});
        },
		function(sessionid,result, callback){
				console.log('RECEIVER FROM DOXS-> ' + payload.phoneID);
				console.log('DOXS EARNED-> ' + config.doxs.take_a_loan);
				var payloadoxs = {phoneID: payload.phoneID, action: 'take_a_loan', type: config.wallet.type.DOX}
				doxsService.saveDoxs(payloadoxs, function(err, result){
					if(err) {
						console.log('ERROR'+ response);
						callback('ERROR IN DOX EARNED', {statusCode:1,additionalInfo : "Error in DOX Service"});
					} else {
						console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
						result.additionalInfo.doxEarned = config.doxs.take_a_loan;
						callback(null, result);
					}
				});
		},

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
				SYSTEMID       : 'AMDOCS' ,
				REQUESTID      :  uuid.v1().replace(/-/g,'') ,
				TIMESTAMP      :  dateTime ,
				COMMAND        : 'REQUESTDECISION' ,
				PID            :  payload.phoneID,
				MSISDN         :  "+" + countryCode + payload.phoneID ,
				CLIENTNAME     :  payload.clientName ,
				IDNUMBER       :  payload.number ,
				BIRTHDATE      :  payload.birthDate ,
				BIRTHPLACE     :  payload.birthPlace ,
				GENDER         :  payload.gender ,
				MARRITALSTATUS :  payload.marritalStatus ,
				ADDRESS        :  payload.address ,
				EMAIL		   :  payload.email
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
					if(result.RESULT.CODE[0] === '0' ){
						console.log('result information ' + 'OK');
					}else if (result.RESULT.CODE[0] === 300 ){
						console.log('result information ' + 'MSISDN that the decision was requested was not found');
						callback('ERROR', result.RESULT.CODE[0]+' '+'MSISDN that the decision was requested was not found');
					}else if (result.RESULT.CODE[0] === 301 ){
						console.log('result information ' + 'System error');
						callback('ERROR', result.RESULT.CODE[0]+' '+'System error');
					}else if  (result.RESULT.CODE[0] === 302 ){
						console.log('result information ' + 'Operation denied');
						callback('ERROR', result.RESULT.CODE[0]+' '+'Operation denied');
					}else if (result.RESULT.CODE[0] === 301 ){
						console.log('result information ' + 'Invalid data');
						callback('ERROR', result.RESULT.CODE[0]+' '+'Invalid data');
					}else{
						console.log('result information ' + 'Unknown error');
					}
					callback(null,result.RESULT);
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
