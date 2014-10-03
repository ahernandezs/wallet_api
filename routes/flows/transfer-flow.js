var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var urbanService = require('../../services/urban-service');

exports.transferFlow = function(payload,callback) {
    async.waterfall([
        function(callback){
            console.log('Create Session');
            var response = null;
            soap.createClient(soapurl, function(err, client) {
                client.createsession({}, function(err, result) {
                    if(err) {
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.createsessionReturn;
                        callback(null, response.sessionid); 
                    }
                });
            });
        },
        function(sessionid, callback){
            console.log('Create hashpin');
            var hashpin = config.username.toLowerCase() + config.pin;
            hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
            hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
            console.log(hashpin);
            callback(null, sessionid, hashpin);
        },
        function(sessionid, hashpin, callback){
            console.log('Login');
            var request = { sessionid: sessionid, initiator: config.username, pin: hashpin };
            var request = {loginRequest: request};
            console.log(request);
            soap.createClient(soapurl, function(err, client) {
                client.login(request, function(err, result) {
                    if(err) {
                        console.log('Error' + err);
                        return new Error(err);
                    } else {
                        var response = result.loginReturn;
                        console.log(response);
                        callback(null,sessionid);
                    }
                });
            });
        },
        function(sessionid, callback){
            console.log('Transfer ' + sessionid);
            console.log(payload);
            console.log(payload.transferRequest.phoneID);
            var requestSoap = { sessionid:sessionid, to: payload.transferRequest.phoneID, amount : payload.transferRequest.amount , type: payload.transferRequest.type };
            var request = { transferRequest: requestSoap };
            console.log(request);
            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if(err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.transferReturn;
                        if(response.result != 0){
                            var response = { statusCode:1 ,  additionalInfo : result };
                            callback("ERROR", response);
                        } else{
                            var response = { statusCode:0 ,  additionalInfo : result };
                            callback(null, response);
                        }
                    }
                });
            });
        },
    ], function (err, result) {
        console.log(result);
        if(err){      
            callback(err,result);    
        }else{
            callback(null,result);    
        }
    });
};

exports.transferFunds = function(data, callback) {
    async.waterfall([
        function(callback) {
            var payload = data.body;
            var header = data.header;
            console.log( 'Running transferFunds ' + payload.sessionid );
            console.log( payload );
            var requestSoap = { sessionid: header.sessionid, to: payload.destiny, amount: payload.amount, type: 1 };
            var request = { transferRequest: requestSoap };
            console.log( request );
            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if (err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.transferReturn;
                        if (response.result != 0) {
                            var response = { statusCode: 1, additionalInfo: result };
                            callback('ERROR', response);
                        } else {
                            payload.phoneID = payload.destiny;
                            delete payload.destiny;
                            callback(null, payload);
                        }
                    }
                });
            });
        },
        function(data, callback) {
            var message = 'You have received a transfer of $' + data.amount;
            data.message = message;
            var extraData = { current :'10' , dox:'10'};
            data.extra = {extra : extraData} ;
            urbanService.singlePush(data, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The transfer was successful' };
                callback(null, response);
            });
        }
    ], function(err, result) {
        console.log(result);
        if (err) 
            callback(err, result);
        else
            callback(null, result);
    });
};
