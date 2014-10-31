var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var Session = require('../../model/session');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var mailService = require('../../services/sendGrid-service');

exports.requestPinFlow = function(phoneID,callback) {
    async.waterfall([
        function(callback) {
            console.log( 'Getting credentials for phoneID: ' + phoneID );
            Session.findOne( { 'phoneID': phoneID }, 'pin', function(err, credentials) {
                if (err) {
                    console.log(err.message);
                    callback( 'ERROR', { message: 'Something went wrong' } );
                } else if (credentials === null)
                    callback('ERROR', response);
                else
                    callback( null, { phoneID : phoneID, pin : credentials.pin } );
            });
        },
        function(credentials, callback) {
            Userquery.findUserByPhoneID(phoneID, function(err, result){
                if (err) {
                    var response = { statusCode : 1,  additionalInfo : err };
                    callback('ERROR', response);
                } else {
                    credentials.email = result.email;
                    credentials.name = result.name;
                    callback(null, credentials);
                }
            });
        },
        function(user, callback) {
            mailService.sendForgottenPIN(user, function(err, message) {
                if (err)
                    callback('ERROR', message);
                else
                    callback(null, { statusCode : 0, message : 'Your PIN has been sent by email' } );
            });
        }
    ], function (err, result) {
        if(err){      
            callback(err,result);    
        } else {      
            callback(null,result);    
        }
    });
};
