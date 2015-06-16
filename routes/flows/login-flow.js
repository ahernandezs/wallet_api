var async = require('async');
var soap = require('soap');
var moment = require('moment-timezone');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var User = require('../../model/user');
var UserLoginFlow = require('./login-flow');
var soapurl = process.env.SOAP_URL;
var soapurlNew = process.env.SOAP_URL_NEW;
var wallet = require('../wallet');
var session =  require('../../model/queries/session-query');
var msgQuery =  require('../../model/queries/message-query');
var user =  require('../users');
var config = require('../../config.js');
var logger = config.logger;


exports.loginFlow = function(payload,callback) {
    var info = {};
  async.waterfall([
    function(callback){

      Userquery.confirmPin(payload.phoneID, function(err, person) {
        if(err){
          logger.error(err);
          var response = { statusCode:1 ,  additionalInfo : err };
          callback(err,response);
        }
        else {
          if(person.pin === payload.pin){
            logger.info('You have been logged in');
            info.email = person.email;
            info.company = person.company;
            info.name = person.name;
            info.profileCompleted = person.profileCompleted;
            callback(null);
          } else{
            var response = { statusCode:1 ,  additionalInfo : 'INVALID PIN' };
            logger.error(response);
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
            logger.error(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
          }else
          callback(null);
        });
      else
        Userquery.singleUpdateUser({phoneID:payload.phoneID, group: config.group.env.PUBLIC},function (err,result) {
          if(err) {
            logger.error(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
          }else
          callback(null);
        });
    },
    function(callback){
      logger.info('Validate connection');
      var response = null;
      soap.createClient(soapurl, function(err, client) {
        if(err) {
          logger.error(err);
          var response = { statusCode: 3 ,  additionalInfo : 'Service Unavailable' };
          callback(err,response);
        }else
        callback(null);
      });
    },
    function(callback){
      logger.info('Create Session');
      var response = null;
      soap.createClient(soapurl, function(err, client) {
        client.createsession({}, function(err, result) {
          if(err) {
            logger.error(err);
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
        logger.info( 'Register Session' );
        var data = {};
        data.phoneID = payload.phoneID;
        data.pin = payload.pin;
        data.token = sessionid;

        if(payload.group)
          data.group = payload.group;
        else
          data.group = config.group.env.PUBLIC;

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
      logger.info('Create hashpin');
      var hashpin = payload.phoneID.toLowerCase() + payload.pin ;
      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
      logger.info(hashpin);
      callback(null, sessionid, hashpin);
    },
    function(sessionid, hashpin, callback){
      logger.info('Login');
      var  request = { sessionid: sessionid, initiator: payload.phoneID , pin: hashpin  };
      var request = {loginRequest: request};
      soap.createClient(soapurl, function(err, client) {
        client.login(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            var response = result.loginReturn;
            logger.info(response);
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
      logger.info('Search NotRead msgs connection');
      var response = null;
      msgQuery.getMessagesNoRead(payload.phoneID, function(err, result) {
        if(err) {
          logger.error(err);
          var response = { statusCode:1 ,  additionalInfo : err };
          callback(err,response);
        }else{
          logger.info(result.length);
          callback(null,sessionid,result.length);
        }
      });
    },

    function(sessionid,length,callback){
      logger.info('balance ');
      var currentMoney, currentDox;
      soap.createClient(soapurlNew, function(err, client) {
        client.setSecurity(new soap.WSSecurity( payload.phoneID,payload.pin,'PasswordDigest'));
        client.Balance({}, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            if(result.result  === '0' ) {

              try{
                if(result.wallets.wallet[0].attributes.id){
                  if(result.wallets.wallet[0].attributes.id === 'wallet.ewallet')
                    currentMoney = result.wallets.wallet[0].current.attributes.amount
                   else
                      currentMoney = result.wallets.wallet[1].current.attributes.amount;
                }
              }catch(err){
                currentMoney = 0;
              }
            

              try {
                if(result.wallets.wallet[1].attributes.id){
                  if(result.wallets.wallet[1].attributes.id === 'wallet.points')
                    currentDox = result.wallets.wallet[1].current.attributes.amount
                  else{
                    if(result.wallets.wallet[2].attributes.id === 'wallet.points')
                      currentDox = result.wallets.wallet[2].current.attributes.amount;
                    else
                      currentDox = result.wallets.wallet[3].current.attributes.amount;
                  }
                }
              }catch(err){
                currentDox = 0;
              }

              var balance = { current : currentMoney , dox : currentDox , unreadMsgs :length } ;
              console.log('get balance');
              info.reportAdmin = 'YES';
              response = { statusCode: 0, sessionid : sessionid, additionalInfo : balance, userInfo : info };
            }
            else{
              console.log('Errorrrrr');
              response = { statusCode:1 ,  additionalInfo : response };
            }
            callback(null,response);
          }
        });
      });
    },
    ], function (err, result) {
      logger.info(result);
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
            logger.info( 'Calculate session lifetime' );
            User.findOne({ phoneID : phoneID }, 'lastSession', function(err, data) {
                if (err)
                    callback('ERROR', data);
                else {
                    try {
                        var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
                        var moment = require('moment');
                        var startDate = moment( data.lastSession, 'YYYY-M-DD HH:mm:ss' );
                        var endDate = moment( dateTime, 'YYYY-M-DD HH:mm:ss' );
                        var difference = endDate.diff(startDate, 'minutes');
                        logger.info(difference + ' minutes');
                        if (difference > 4)
                            callback(null, true);
                        else
                            callback(null, false);
                    } catch (e) {
                        logger.warn(e);
                        callback(null, true);
                    }
                }
            });
        },
        function(getBalance, callback) {
            if (getBalance) {
                logger.info( 'Getting balance' );
                logger.info(request);
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
            logger.info( 'is there a session?: ' + data.session );
            request.phoneID = phoneID;
            if (data.session){
                session.getSession(phoneID,function(err,result){
                    if (err)
                      callback('ERROR', err);
                    else
                      callback('STOP', result.token);
                });
            }
            else
                session.getCredentials(request, function(err, result) {
                    if (err === 'ERROR')
                        callback('ERROR', result);
                    else
                        callback(null, result.data);
                });
        },
        function(info, callback) {
            logger.info('Authenticate User');
            info.body = { 'phoneID' : info.phoneID, 'pin' : info.pin, 'continue' : true, 'group': info.group };
            UserLoginFlow.loginFlow(info, function(err,result) {
                if(err){
                  console.log(err);
                }else {
                  if (result.statusCode != 0)
                      callback('ERROR', result.message);
                  else {
                      info.token = result.sessionid;
                      callback(null, info);
                  }
                }
            });
        },
        function(info, callback) {
            console.log('Update Session');
            console.log(info);
            console.log(request);
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
        else{
            console.log('Finalize Flow');
            callback(null, result);   
        }
    });
};
