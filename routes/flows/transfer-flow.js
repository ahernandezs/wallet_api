var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../model/userQueryBuilder');
var soapurl = process.env.SOAP_URL;

var username = 'anzen_01';
var pin  = '1234';

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
      var hashpin = username.toLowerCase() + pin ;
      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
      console.log(hashpin);
      callback(null, sessionid, hashpin);
    },
    function(sessionid, hashpin, callback){
      console.log('Login');
      var  request = { sessionid: sessionid, initiator: username, pin: hashpin  };
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
      var requestSoap = { sessionid:sessionid, to: payload.phoneID, amount : payload.amount , type: payload.type };
      var request = { registerRequest: requestSoap };
      console.log(request);
      soap.createClient(soapurl, function(err, client) {
        client.register(request, function(err, result) {
          if(err) {
            console.log(err);
            return new Error(err);
          } else {
            console.log(result);
            var response = result.registerReturn;
            if(response.result != 0){
                var response = { statusCode:1 ,  additionalInfo : result };
               callback("ERROR", response);
            }
            else
              callback(null,sessionid);
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
