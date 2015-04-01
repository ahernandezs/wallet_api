var soap = require('soap');
var async = require('async');
var transferFlow = require('../routes/flows/transfer-flow');
var userQuery = require('../model/queries/user-query');
var config = require('../config.js');

var sendgrid  = require('sendgrid')(config.sendGrid.user, config.sendGrid.password);

exports.sendMail = function(sender,message, callback){
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

exports.sendRegisterMessage= function(user, callback){
    console.log('Writting email');
    var email = new sendgrid.Email({
        to:         user.email,
        from:       'no-reply@amdocswallet.com',
        subject:    'Welcome to Banamex Wallet',
        text:       'hello'
    });

    callback(null,'successful');
    /*
    async.waterfall([
        function(callback) {
            console.log( 'Reading html file' );
            var fs = require('fs');
            var __dirname = 'resources';
            fs.readFile( __dirname + '/index.html', function (err, data) {
              if (err) {
                callback('ERROR', 'There was an error sending the email');
              }
                callback(null, data.toString());
            });
        },
        function(html, callback) {
            html = html.replace('1234', user.pin);
            email.setHtml(html);
            sendgrid.send(email, function(err, json) {
                if (err) {
                    callback('ERROR', err);
                } else {
                    callback(null, json);
                }
            });
        }
    ], function (err, result) {
        if(err){      
            callback(err,result);    
        } else {      
            callback(null,result);    
        }
    });*/
};

exports.sendForgottenPIN = function(user, callback) {
    console.log('Writting email');
    sendgrid.send({
        to:         user.email,
        from:       'no-reply@amdocswallet.com',
        subject:    'Forgotten PIN',
        text:       'Dear ' + user.name + ',\n\n' +
                    'Your PIN is ' + user.pin + '.\n\n' +
                    'Banamex Wallet Team'
    }, function(err, json) {
        if (err) {
            callback('ERROR', err);
        } else {
            callback(null, json);
        }
    });
};

function createMail (sender,message,callback){
	var emailMessage = {};
	async.waterfall([
		function(callback){
			userQuery.findUserByPhoneID(sender,function(err,result){
				if(err){
					callback("Error! "+err);
				}else{
					emailMessage.sender = result.email;
					callback(null);
				}
			});
		},
		function(callback){
			userQuery.findUserByPhoneID(message.phoneID,function(err,result){
				if(err){
					callback("Error! "+err);
				}else{
					emailMessage.receiver = result.email;
					callback(null);
				}			
			});
		},
		function(callback){
			emailMessage.subject = message.title;
			if(message.message)
				emailMessage.text = message.message;
			else
				emailMessage.text = message.title;
			callback(null);
		},
		], function (err, result) {
			if(err){
				callback("Error! "+err);
			}else{
				console.log(result);
				callback(null,emailMessage);
			}
	});
};

exports.sendInvitation= function(friend, callback){
	console.log('Sending invitation: '+JSON.stringify(friend));
    var email = new sendgrid.Email({
		to:        friend.email,
		from:      'no-reply@amdocswallet.com',
		subject:   'Check out the Banamex Mobile Wallet!',
        text:       config.mailInvite.header + '\n\n'+ config.mailInvite.bodyInit + '\n\n'
                    + config.mailInvite.bodyMid1 + '\n\n'
                    + config.mailInvite.bodyMid2 + '\n\n'
                    + friend.url + '\n\n'
                    + config.mailInvite.bodyEnd + '\n\n'
                    + config.mailInvite.footer + '\n\n'
                    + friend.sender+ '\n\n'
    });

sendgrid.send(email, function(err, json) {
        if (err) {
            callback('ERROR', err);
        } else {
            callback(null, json);
        }
    });
};
