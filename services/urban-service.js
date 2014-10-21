var UserQuery = require('../model/queries/user-query');
var UA = require('urban-airship');
var merchantQuery = require('../model/queries/merchant-query');
var config = require('../config.js');
var uaStore = new UA('eHiXHtSFTYK4aaWcTAnehQ', 'nv8zr5nTS0imBwWE7a3H4Q', 'nv8zr5nTS0imBwWE7a3H4Q');
var ua = new UA('4RZ6Xlf7Q7i8fqeag8Bh6g', 'QHgOFp6uQjaAFPi11qqYGw', 'QHgOFp6uQjaAFPi11qqYGw');


exports.singlePush = function(req, callback) {
	console.log("phoneID: " + req.phoneID);
	UserQuery.findAppID(req.phoneID, function(err,result) {
		var deviceID = null;
		var payload = {
			'notification': {
				'alert': req.message
			},
			"device_types" : [ "ios", "android" ]
		};
		if(result.OS === 'ANDROID'){
			deviceID = {'apid' : result.appID };
			if(req.extra){
				var extraPayload = {extra : req.extra}
				payload.notification['android'] = req.extra;
			}
		}
		else{
			deviceID = {'device_token' : result.appID } ;
			if(req.extra){
				var extraPayload = {extra : req.extra}
				payload.notification['ios'] = req.extra;
			}
		}

		payload['audience'] = deviceID;
		console.log(payload);
		if(result.environment && (result.environment === 'PRODUCTION')){
			uaStore.pushNotification('/api/push', payload, function(error) {
				if (error) {
					console.log('Error to send notification' + error);
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
				} else {
					console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);
				}
			});
		}
		else{
			ua.pushNotification('/api/push', payload, function(error) {
				if (error) {
					console.log('Error to send notification' + error);
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
				} else {
					console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);
				}
			});
		}
	});
};

exports.singlePush2Merchant = function(req, callback) {
	console.log(req);
	console.log("appID: " + req.appID);
	var deviceID = null;
	var payload = {
		'notification': {
			'alert': req.message
		},
		"device_types" : [ "ios", "android" ]
	};
	if(req.OS === 'ANDROID'){
		deviceID = {'apid' : req.appID };
		if(req.extra){
			var extraPayload = {extra : req.extra}
			payload.notification['android'] = req.extra;
		}
	}
	else{
		deviceID = {'device_token' : req.appID } ;
		if(req.extra){
			var extraPayload = {extra : req.extra}
			payload.notification['ios'] = req.extra;
		}
	}

	payload['audience'] = deviceID;

	console.log(payload);
	merchantQuery.getMerchanByAppID(req.appID,function(err,result) {
		if(result.environment && (result.environment === 'PRODUCTION')){
			uaStore.pushNotification('/api/push', payload, function(error) {
				if (error) {
					console.log('Error to send notification' + error);
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
				} else {
					console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);
				}
			});
		}
		else{
			ua.pushNotification('/api/push', payload, function(error) {
				if (error) {
					console.log('Error to send notification' + error);
					var response =  { statusCode: 1 ,  message: 'Error to send notification' };
					callback("ERROR", response);
				} else {
					console.log('Notification sent correctly');
					var response = { statusCode: 0 ,  message: 'Notification sent correctly' };
					callback(null, response);
				}
			});
		}
	});
};
