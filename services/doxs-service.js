var soap = require('soap');
var transferFlow = require('../routes/flows/transfer-flow');
var config = require('../config.js');
var mubsub = require('mubsub');
var userQuery = require('../model/queries/user-query');
var async = require('async');
var soapurl = process.env.SOAP_URL_NEW;

var client = mubsub(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||   'mongodb://localhost/amdocs');
var channel = client.channel('leaderboard_channel');

client.on('error', console.error);
channel.on('error', console.error);

exports.saveDoxs = function(payload,callback) {
    console.log('Transfering DOX new ....');
    var awardPointsRequest = { amount:config.doxs[payload.action] ,recipient:payload.phoneID};
    soap.createClient(soapurl, function(err, client) {
        client.setSecurity(new soap.WSSecurity( 'anzen_01','1234','PasswordDigest'));
        client.AwardPoints(awardPointsRequest, function(err, result) {
            if(err) {
              if(err.body.indexOf('successful')  >= 0 ){
                    var response = { statusCode:0 ,  additionalInfo : 'successful' };
                    callback(null, response);
              }else{
                    var response = { statusCode:1 ,  additionalInfo : result };
                    callback("ERROR", response);
              }
            } else {
                var response = result.transferReturn;
                console.log("Result: "+JSON.stringify(result));
                if(response.result != 0){
                    var response = { statusCode:1 ,  additionalInfo : result };
                    callback("ERROR", response);
                } else{
                    var response = { statusCode:0 ,  additionalInfo : JSON.stringify(result) };
                    callback(null, response);
                }
            }
        });
    });

}
