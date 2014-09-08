var UserQuery = require('../model/userQueryBuilder');
var UA = require('urban-airship');
var ua = new UA('z6DMkdyDQJGD3wZorFFD6g', '6T6NnUa3SBqR-sjTxdjj5g', '6T6NnUa3SBqR-sjTxdjj5g');

exports.singlePush = function(req, res){
	console.log(req.body);

	UserQuery.findAppID(req.body.phoneID, function(err,result){
		var payload = {
			'audience' : {
				'apid' : result
			},
			'notification': {
				'alert': req.body.message
			},
			"device_types" : [ "ios", "android" ]
		};
		console.log(payload);
		ua.pushNotification('/api/push', payload, function(error) {
			if(error) {
				console.log('Error to send notification ' + error);
				var response =  { statusCode: 0 ,  message: 'Error to send notification' };
				res.json(response);
			}
			console.log('notification sent  correctly ');
			var response = { statusCode: 0 ,  message: 'Notification sent  correctly' };
			res.json(response)
		});
	});
}
