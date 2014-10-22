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
				from:      mail.sender,
				subject:   mail.subject,
				text:      mail.text
			}, function(err, json) {
				if (err) { return console.error(err); }
				console.log(json);
			});
		}
	});
}

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
			emailMessage.text = message.message;
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
}
