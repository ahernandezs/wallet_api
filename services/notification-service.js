var UserQuery = require('../model/queries/user-query');
var async = require('async');
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
			console.log(JSON.stringify(requestWrapper));
			var Client = require('node-rest-client').Client;
			var client = new Client();
			// set content-type header and data as json in args parameter
			var args = {
			  data:  requestWrapper ,
			  headers:{"Content-Type": "application/json"}
			};
			client.post("http://cp.pushwoosh.com/json/1.3/createMessage", args, function(data,response) {
				console.log('Response Push -->');
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
		if(result.environment  && result.environment === 'PRODUCTION')
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
	var request = {};

	request.auth = 'Cwo07DWkNLLPE79PRpBiSuFPEJmhMsgZnMWpAe5js3uIaAMMaRhYaaYN4rdLlSA0pspaiXSFR7EMRQYMfxFi';
	var notifications = [];
	var devices = [];
	//appID
	//devices.push(result.appID);

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

	callback(null,requestWrapper);
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
			merchantQuery.getMerchantsNotifications(function(err,merchants){
				if(merchants){
					console.log(merchants);
					async.forEach(merchants, function (merchant, callback){
						if(merchant.environment  && merchant.environment === 'PRODUCTION')
							requestWrapper.request.application = '2739D-ACE37';
						else
							requestWrapper.request.application = '8AF81-19402';
						requestWrapper.request.notifications[0].devices.push(merchant.appID);
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
							}
							else{
								console.log('Error to send notification');
							}
						});
						callback();
					}, function(err) {
						if(err){
							console.log('Error to send notification');
							var response =  { statusCode: 1 ,  message: 'Error to send notification' };
							callback("ERROR", response);
						}else{
							console.log('All notifications sents correctly');
							var response = { statusCode: 0 ,  message: 'All Nsotifications sents correctly' };
							callback(null, response);
						}
					    console.log('iterating done');
					});
				}
			});
		}
	});
};
