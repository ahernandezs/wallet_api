var UserQuery = require('../model/queries/user-query');
var UA = require('urban-airship');
var ua = new UA('z6DMkdyDQJGD3wZorFFD6g', '6T6NnUa3SBqR-sjTxdjj5g', '6T6NnUa3SBqR-sjTxdjj5g');

exports.singlePush = function(req, callback) {
	console.log("phoneID: " + req.phoneID);
	UserQuery.findAppID(req.phoneID, function(err,result) {
		console.log(result);
		var deviceID = null;
		if(result.OS === 'ANDROID')
			deviceID = {'apid' : result.appID };
		else
			deviceID = {'device_token' : result.appID } ;

		var payload = {
			'notification': {
				'alert': req.message
			},
			"device_types" : [ "ios", "android" ]
		};
		payload['audience'] = deviceID;
		console.log(payload);
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
	});
};
