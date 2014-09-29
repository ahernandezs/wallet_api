var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;


exports.loginFlow = function(payload,callback) {
  async.waterfall([
    function(callback){
      Userquery.confirmPin(payload.phoneID, function(err, pin) {
        if(err){
            console.log(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
        }
        else {
          if(pin === payload.pin)
            callback(null);
          else{
            var response = { statusCode:1 ,  additionalInfo : 'INVALID PIN' };
            callback('ERROR',response);
          }
        }
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
      var hashpin = payload.phoneID.toLowerCase() + payload.pin ;
      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
      console.log(hashpin);
      callback(null, sessionid, hashpin);
    },
    function(sessionid, hashpin, callback){
      console.log('Login');
      var  request = { sessionid: sessionid, initiator: payload.phoneID , pin: hashpin  };
      var request = {loginRequest: request};
      soap.createClient(soapurl, function(err, client) {
          client.login(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.loginReturn;
            console.log(response);
            if(response.result  === 0 )
              var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };       
            else
              var response = { statusCode:1 ,  additionalInfo : response };

            callback(null,response);
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
