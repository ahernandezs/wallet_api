var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var sessionUser = require('./login-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.registerFlow = function(payload,callback) {
  var transfer = true;
  var end = '00'

  console.log(endsWith(payload.phoneID, end));
  async.waterfall([
    function(callback){
      console.log('Validate connection');
      var response = null;

      //payload.phoneID = payload.phoneID +'ES';
      console.log('Validate phoneID ---->' + payload.phoneID);
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
      var requestSoap = { sessionid:sessionid, agent: payload.phoneID, name : payload.name , email_address: payload.email_address , reportAdmin: 'YES'};
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
                if (response.result === 18) {
                    transfer = false;
                  callback(null,sessionid);
                } else {
                  var response = { statusCode:1 ,  additionalInfo : result };
                  callback("ERROR", response);
                }
            }
            else {
              callback(null,sessionid);
            }
          }
        });
      });
      },
      function(sessionid, callback){
        payload.profileCompleted = 0;
        payload.canPurchase ='YES';
        console.log('Register in Mongo ' + sessionid);
        Userquery.validateUser( payload.phoneID, function (err, result) {
          if(result.statusCode === 0)
            callback(null,sessionid);
          else
            Userquery.createUser(payload,function(err,result){
              if (err) return handleError(err);
              else
                callback(null,sessionid);
            });
        });
      },
    function(sessionid,callback){
      console.log('Reset PIN ' + sessionid);
      var requestSoap = { sessionid:sessionid, new_pin: payload.pin , agent: payload.phoneID, suppress_pin_expiry: true };
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
        if (transfer) {
            console.log('Transfer ' + sessionid);
            var requestSoap = { sessionid:sessionid, to: payload.phoneID, amount : 100 , type: 1 };
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
                            sessionUser.loginFlow({phoneID:payload.phoneID , pin :payload.pin },function(err,result){
                                callback(null, result);
                            });
                        }
                    }
                });
            });
          } else {
            if(payload.group){
              sessionUser.loginFlow({phoneID:payload.phoneID , pin :payload.pin, group : payload.group },function(err,result){
                callback(null, result);
              });
            }
            else{
              sessionUser.loginFlow({phoneID:payload.phoneID , pin :payload.pin, group : config.group.env.PUBLIC },function(err,result){
                callback(null, result);
              });
            }
          }
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
