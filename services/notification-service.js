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
			var options = {
			  host: 'cp.pushwoosh.com',
			  path: '/json/1.3/createMessage',
			  method: 'POST'
			};
			var httpRequest = https.request(options, function(res) {  
			  console.log('starting request');
			  res.on('data', function (chunk) {
			    console.log('RESPONSE: ' + chunk);
			    var responseStatus = JSON.parse(chunk);
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
			})
			console.log('Payload messsage ' + JSON.stringify(requestWrapper));
			httpRequest.write(JSON.stringify(requestWrapper));
			httpRequest.end();
		}
	});

};

buildPayload = function(req,callback){
	UserQuery.findAppID(req.phoneID, function(err,result) {
		if(result.appID === 0)
			callback(null,null);

		var request = {};
		request.application = '98BF1-8CB13';
		request.auth = 'TwMGS2EoXPu9iDcbGncSHrcePHFClrVvkX8aCBRbBaorJYDEd0f8rZbrj912uTgPuiaqfMl856nLK9Xw90tj';
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

		callback(null,requestWrapper);
	});
}

buildMerchantPayload = function(req,callback){
		merchantQuery.getMerchanByAppID(req.appID,function(err,result) {
			if(result.appID === 0)
				callback(null,null);

			var request = {};
			request.application = '98BF1-8CB13';
			request.auth = 'TwMGS2EoXPu9iDcbGncSHrcePHFClrVvkX8aCBRbBaorJYDEd0f8rZbrj912uTgPuiaqfMl856nLK9Xw90tj';
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

			callback(null,requestWrapper);
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
			var options = {
			  host: 'cp.pushwoosh.com',
			  path: '/json/1.3/createMessage',
			  method: 'POST'
			};

			var httpRequest = https.request(options, function(res) {  
			  console.log('starting request');
			  res.on('data', function (chunk) {
			    console.log('RESPONSE: ' + chunk);
			    var responseStatus = JSON.parse(chunk);
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
			})
			console.log('Payload messsage ' + JSON.stringify(requestWrapper));
			httpRequest.write(JSON.stringify(requestWrapper));
			httpRequest.end();
		}
	});
};
