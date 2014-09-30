var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;

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
      var requestSoap = { sessionid:sessionid, agent: payload.phoneID, name : payload.name , email_address: payload.email_address };
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
    function(sessionid, callback){
      console.log('Register in Mongo ' + sessionid);
      Userquery.createUser(payload,function(err,result){
          if (err) return handleError(err);
          else
            callback(null,sessionid);
      });
    },
    function(sessionid,callback){
      console.log('Reset PIN ' + sessionid);
      var requestSoap = { sessionid:sessionid, new_pin: payload.pin , agent: payload.phoneID, suppress_pin_expiry:'true' };
      var request = { resetPinRequestType: requestSoap };
      console.log(request);
      soap.createClient(soapurl, function(err, client) {
        client.resetPin(request, function(err, result) {
          if(err) {
            console.log(err);
            return new Error(err);
          } else {
            console.log(result);
            var response = { statusCode:0 ,  additionalInfo : result.resetPinReturn };
            callback(null, sessionid);
          }
        });
      });
    },
    function(sessionid,callback){
      console.log('Transfer ' + sessionid);
      var requestSoap = { sessionid:sessionid, to: payload.phoneID, amount : 2 , type: 3 };
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
            }
            else{
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
