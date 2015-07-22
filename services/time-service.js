var moment = require('moment-timezone');

exports.crateTimeStamp = function(sender,message, callback){
	createMail(sender,message,function(err,mail){
		if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to create email message' });
		else {
			sendgrid.send({
				to:        mail.receiver,
				from:      'no-reply@amdocswallet.com',
				subject:   mail.subject,
				text:      mail.text
			}, function(err, json) {
				if (err) { return console.error(err); }
				console.log(json);
			});
		}
	});
}


exports.getSchedulerLabel = function(callback){
	var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
	var hour = new Date().getHours();
	console.log('Get actual hour '+hour);
	if ( hour  < process.env.SCHEDULE_CHANGE)
		callback(null,'MORNING');
	else
		callback(null,'AFTERNOON');
}
