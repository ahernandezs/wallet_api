var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;
var wallet = require('../wallet');
var session =  require('../../model/queries/session-query');
var user =  require('../users');


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
            console.log(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
          } else {
            console.log(result);
            var response = result.createsessionReturn;
            callback(null, response.sessionid); 
          }
        });
      });
    },
    function(sessionid, callback) {
        console.log( 'Register Session' );
        var data = {};
        data.phoneID = payload.phoneID;
        data.pin = payload.pin;
        data.token = sessionid;
        session.createSession(data, function(err, result) {
            if (err)
                callback('ERROR', result.message);
            else
                callback(null, sessionid);
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

            callback(null,sessionid);
          }
        });
      });
    },
    function(sessionid, callback){
      console.log('balance e-wallet');
      var request = { sessionid: sessionid, type: 1  };
      var request = {balanceRequest: request};
      console.log(request);
      soap.createClient(soapurl, function(err, client) {
        client.balance(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.balanceReturn;
            console.log(response);
            if(response.result  === '0' )
              var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
            else
              var response = { statusCode:1 ,  additionalInfo : response };

            callback(null,sessionid,response.additionalInfo.current);
          }
        });
      });
    },
    function(sessionid,currentMoney, callback){
      console.log('balance Points');
      var  request = { sessionid: sessionid, type: 3  };
      var request = {balanceRequest: request};
      console.log(request);
      soap.createClient(soapurl, function(err, client) {
        client.balance(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.balanceReturn;
            console.log(response);
            if(response.result  === '0' ) {
              var balance = { current : currentMoney , dox : response.current  } ;
              response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : balance };
            }
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

exports.regenerate = function(request, res, callback) {
    async.waterfall([
        function(callback) {
            wallet.balance(request, function(err, response) {
                if (err)
                    callback('ERROR', response );
                else {
                    var result;
                    if (response.result != 0) {
                        result = { session: false };
                        callback(null, result);
                    }
                    else {
                        result = { session: true };
                        callback(null, result);
                    }
                }
            });
        },
        function(data, callback) {
            console.log( 'is there a session?: ' + data.session );
            if (data.session)
                callback('STOP', { result: request.sessionid });
            else
                session.getCredentials(request.sessionid, function(err, result) {
                    if (err)
                        callback('ERROR', result);
                    else
                        callback(null, result.data);
                });
        },
        function(info, callback) {
            info.body = { 'phoneID' : info.phoneID, 'pin' : info.pin };
            user.login(info, res, function(result) {
                if (result.statusCode != 0)
                    callback('ERROR', result.message);
                else {
                    info.token = result.token;
                    callback(null, info);
                }
            });
        },
        function(info, callback) {
            session.updateSession(request, info, function(err, result) {
                if (err)
                    callback('ERROR', result.message);
                else
                    callback(null, result.token);
            });
        }
    ], function(err, result) {
        if (err) 
            callback(err, result);
        else
            callback(null, result);   
    });
};
