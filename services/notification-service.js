var UserQuery = require('../model/queries/user-query');
var UA = require('urban-airship');
var merchantQuery = require('../model/queries/merchant-query');
var config = require('../config.js');
var https = require('https');



exports.singlePush = function(req, callback) {
	console.log("phoneID: " + req.phoneID);
	buildPayload(req, function(err,requestWrapper) {
		if(!requestWrapper){
			console.log('Notification sent correctly, not exist APPID linked');
			var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
			callback(null, response);
		}
		else{
			var Client = require('node-rest-client').Client;
			var client = new Client();
			// set content-type header and data as json in args parameter
			var args = {
			  data:  requestWrapper ,
			  headers:{"Content-Type": "application/json"}
			};
			client.post("http://cp.pushwoosh.com/json/1.3/createMessage", args, function(data,response) {
				console.log('Response Push -->');
			    console.log(JSON.parse(data));
			    var responseStatus = JSON.parse(data);
			    if(responseStatus.status_code === 200){
			    	console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);	
			    }
			    else{
					console.log('Error to send notification');
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
		    	}
			});
		}
	});
};

buildPayload = function(req,callback){
	UserQuery.findAppID(req.phoneID, function(err,result) {
		if(result.appID === 0)
			callback(null,null);

		var request = {};
		if(result.environment  && result.environment === PRODUCTION)
			request.application = '2739D-ACE37';
		else
			request.application = '8AF81-19402';

		request.auth = 'Cwo07DWkNLLPE79PRpBiSuFPEJmhMsgZnMWpAe5js3uIaAMMaRhYaaYN4rdLlSA0pspaiXSFR7EMRQYMfxFi';
		var notifications = [];
		var devices = [];
		//appID
		devices.push(result.appID);

		notifications.push({
			'devices' : devices ,  
			send_date : 'now',
			ignore_user_timezone : true,
			content : req.message,
			data: {}
		});

		request.notifications = notifications;
		var requestWrapper = {'request': request};
		if(req.extra){
			requestWrapper.request.notifications[0].data = req.extra;
		}
		callback(null,requestWrapper,result.environment);
	});
}

buildMerchantPayload = function(req,callback){
		merchantQuery.getMerchanByAppID(req.appID,function(err,result) {
			if(result.appID === 0)
				callback(null,null);

			var request = {};
			if(result.environment  && result.environment === PRODUCTION)
				request.application = '2739D-ACE37';
			else
				request.application = '8AF81-19402';

			request.auth = 'Cwo07DWkNLLPE79PRpBiSuFPEJmhMsgZnMWpAe5js3uIaAMMaRhYaaYN4rdLlSA0pspaiXSFR7EMRQYMfxFi';
			var notifications = [];
			var devices = [];
			//appID
			devices.push(result.appID);

			notifications.push({
				'devices' : devices ,  
				send_date : 'now',
				ignore_user_timezone : true,
				content : req.message,
				data: {}
			});

			request.notifications = notifications;
			var requestWrapper = {'request': request};
			if(req.extra){
				requestWrapper.request.notifications[0].data = req.extra;
				console.log(req.extra);
			}

			callback(null,requestWrapper,result.environment);
	});
}

exports.singlePush2Merchant = function(req, callback) {
	console.log("phoneID: " + req.phoneID);
	buildMerchantPayload(req, function(err,requestWrapper) {
		if(!requestWrapper){
			console.log('Notification sent correctly, not exist APPID linked');
			var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
			callback(null, response);
		}
		else{
			var Client = require('node-rest-client').Client;
			var client = new Client();
			// set content-type header and data as json in args parameter
			var args = {
			  data:  requestWrapper ,
			  headers:{"Content-Type": "application/json"}
			};
			client.post("http://cp.pushwoosh.com/json/1.3/createMessage", args, function(data,response) {
				console.log('Response Push -->');
			    console.log(JSON.parse(data));
			    var responseStatus = JSON.parse(data);
			    if(responseStatus.status_code === 200){
			    	console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);	
			    }
			    else{
					console.log('Error to send notification');
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
		    	}
			});
		}
	});
};