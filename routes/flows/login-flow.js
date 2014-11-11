var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var User = require('../../model/user');
var soapurl = process.env.SOAP_URL;
var wallet = require('../wallet');
var session =  require('../../model/queries/session-query');
var msgQuery =  require('../../model/queries/message-query');
var user =  require('../users');


exports.loginFlow = function(payload,callback) {
    var info = {};
  async.waterfall([
    function(callback){

      Userquery.confirmPin(payload.phoneID, function(err, person) {
        if(err){
          console.log(err);
          var response = { statusCode:1 ,  additionalInfo : err };
          callback(err,response);
        }
        else {
          if(person.pin === payload.pin){
            console.log('You have been logged in');
            info.email = person.email;
            info.company = person.company;
            info.name = person.name;
            info.profileCompleted = person.profileCompleted;
            callback(null);
          } else{
            var response = { statusCode:1 ,  additionalInfo : 'INVALID PIN' };
            console.log(response);
            callback('ERROR',response);
          }
        }
      });
    },
    //Update environment
    function(callback){
      if(payload.group)
        Userquery.singleUpdateUser({phoneID:payload.phoneID, group: payload.group},function (err,result) {
          if(err) {
            console.log(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
          }else
          callback(null);
        });
      else
        callback(null);
    },
    function(callback){
      console.log('Validate connection');
      var response = null;
      soap.createClient(soapurl, function(err, client) {
        if(err) {
          console.log(err);
          var response = { statusCode: 3 ,  additionalInfo : 'Service Unavailable' };
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
                callback(null, sessionid, data);
        });
    },
    function(sessionid, user, callback) {
        Userquery.updateSession(user, function(err, result) {
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

    function(sessionid,callback){
      console.log('Search NotRead msgs connection');
      var response = null;
      msgQuery.getMessagesNoRead(payload.phoneID, function(err, result) {
        if(err) {
          console.log(err);
          var response = { statusCode:1 ,  additionalInfo : err };
          callback(err,response);
        }else{
          console.log(result.length);
          callback(null,sessionid,result.length);
        }
      });
    },

    function(sessionid,length,callback){
      console.log('balance e-wallet');
      var request = { sessionid: sessionid, type: 1  };
      var request = {balanceRequest: request};
      soap.createClient(soapurl, function(err, client) {
        client.balance(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.balanceReturn;
            if(response.result  === '0' )
              var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
            else
              var response = { statusCode:1 ,  additionalInfo : response };

            callback(null,sessionid,response.additionalInfo.current,length);
          }
        });
      });
    },
    function(sessionid,currentMoney,length,callback){
      console.log('balance Points');
      var  request = { sessionid: sessionid, type: 3  };
      var request = {balanceRequest: request};
      soap.createClient(soapurl, function(err, client) {
        client.balance(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.balanceReturn;
            if(response.result  === '0' ) {
              var balance = { current : currentMoney , dox : response.current ,unreadMsgs :length } ;
              response = { statusCode: 0, sessionid : sessionid, additionalInfo : balance, userInfo : info };
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
    var phoneID = request.phoneID;
    delete request.phoneID;
    async.waterfall([
        function(callback) {
            console.log( 'Calculate session lifetime' );
            User.findOne({ phoneID : phoneID }, 'lastSession', function(err, data) {
                if (err)
                    callback('ERROR', data);
                else {
                    try {
                        var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var moment = require('moment');
                        var startDate = moment( data.lastSession, 'YYYY-M-DD HH:mm:ss' );
                        var endDate = moment( dateTime, 'YYYY-M-DD HH:mm:ss' );
                        var difference = endDate.diff(startDate, 'minutes');
                        console.log(difference + ' minutes');
                        if (difference > 4)
                            callback(null, true);
                        else
                            callback(null, false);
                    } catch (e) {
                        console.log(e);
                        callback(null, true);
                    }
                }
            });
        },
        function(getBalance, callback) {
            if (getBalance) {
                console.log( 'Getting balance' );
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
            } else {
                var data = { session : true };
                callback(null, data);
            }
        },
        function(data, callback) {
            console.log( 'is there a session?: ' + data.session );
            request.phoneID = phoneID;
            if (data.session)
                callback('STOP', request.sessionid);
            else
                session.getCredentials(request, function(err, result) {
                    if (err === 'ERROR')
                        callback('ERROR', result);
                    else
                        callback(null, result.data);
                });
        },
        function(info, callback) {
            info.body = { 'phoneID' : info.phoneID, 'pin' : info.pin, 'continue' : true };
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
                else {
                    var token = result.token;
                    callback(null, token);
                }
            });
        }
    ], function(err, result) {
        if (err) 
            callback(err, result);
        else
            callback(null, result);   
    });
};
