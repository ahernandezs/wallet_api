var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var sessionUser = require('./login-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

exports.resetPinFlow = function(payload,callback) {
  async.waterfall([
    function(callback){
      console.log('Validate connection');
      var response = null;
      soap.createClient(soapurl, function(err, client) {
        if(err) {
          console.log(err);
          var response = { statusCode:1 ,  additionalInfo : err };
          callback(err,response);
        }else
        callback(null);
      });
    },
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
      var hashpin = config.username.toLowerCase() + config.pin ;
      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
      console.log(hashpin);
      callback(null, sessionid, hashpin);
    },
    function(sessionid, hashpin, callback){
      console.log('Login');
      var  request = { sessionid: sessionid, initiator: config.username, pin: hashpin  };
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
    function(sessionid, callback){
      payload.profileCompleted = 0;
      console.log('Updte user in Mongo ' + sessionid);
      Userquery.singleUpdateUser(payload,function(err,result){
        if (err) {
            var response = { statusCode:1 ,  additionalInfo : result.resetPinReturn };
            callback('ERROR',response);
        }
        else{
            var response = { statusCode:0 ,  additionalInfo : 'CHANGE PIN SUCCESFUL' };
            callback(null,response);
        }
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
