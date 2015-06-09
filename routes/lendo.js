var Hawk = require('hawk');

exports.notification = function(req, res) {
    console.log('LENDO POST method notification ');
    console.log(req.body);
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
