var Hawk = require('hawk');
var notificationService = require('../services/notification-service');
var config = require('../config.js');

exports.notification = function(req, res) {
    console.log('LENDO POST method notification ');
    console.log(req.body);

	if (req.body.hasOwnProperty('event')){
		if(req.body.event == 'has_score'){
			var score = req.body.data.score;
			payload = {};
			payload.phoneID = req.body.client_id;
			payload.message = " Your MAX available loan is $";
			payload.score_type = config.loans.type.DEFAULT;
			payload.max_amount = config.loans.max_amount.DEFAULT;

			if (score >= 700 && score <= 999) {
				payload.score_type = config.loans.type.GREAT;
				payload.max_amount = config.loans.max_amount.GREAT;
			}
			else if (score >= 550 && score < 700) {
				payload.score_type = config.loans.type.GOOD;
				payload.max_amount = config.loans.max_amount.GOOD;
			}
			else if (score >= 450 && score < 550) {
				payload.score_type = config.loans.type.OK;
				payload.max_amount = config.loans.max_amount.OK;
			}
			else if (score >= 100 && score <= 300) {
				payload.score_type = config.loans.type.BAD;
				payload.max_amount = config.loans.max_amount.BAD;
			}
			payload.message = payload.message + payload.max_amount;

			notificationService.singlePush(payload, function(err, result) {
				if (err)
					console.log("Error al enviar notificacion");
				else
					console.log("Notificacion enviada");
			});
		}
	}
    res.send(200);
};

function Succesful(done) {
	function credentials(id, callback) {
		var webhook_auth = {
			key: '',
			algorithm: 'sha256',
			id: id
		};
	return callback(null, webhook_auth)
	}

	var auth_config = {port: 443, host:'http://amdocs.anzen.io'};

	hawk.server.authenticate(req, credentials, auth_config, function(err) {
		done((err || {}).output);
	});
}
