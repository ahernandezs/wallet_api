var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var soapurl = 'http://152.186.37.50:8280/services/umarketsc?wsdl';

var username = 'anzen_01';
var pin  = '1234';

exports.registerFlow = function(payload,callback) {
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
      console.log('Register ' + sessionid);
      var requestSoap = { sessionid:sessionid, agent: payload.agent, name : payload.name , email_address: payload.email_address };
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
            if(response.result == 18)
               callback("ERROR", response);
            else
              callback(null,sessionid);   
          }
        });
      });
    },
    function(sessionid,callback){
      console.log('Reset PIN ' + sessionid);
      var requestSoap = { sessionid:sessionid, new_pin: payload.new_pin , agent: payload.agent, suppress_pin_expiry:'true' };
      var request = { resetPinRequestType: requestSoap };
      console.log(request);
      soap.createClient(soapurl, function(err, client) {
        client.resetPin(request, function(err, result) {
          if(err) {
            console.log(err);
            return new Error(err);
          } else {
            console.log(result);
            var response = result.registerReturn;
            console.log(result);
            callback(null, result);
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
