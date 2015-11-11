var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Message = require('../../model/message');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;

exports.balanceFlow = function(sessionid, phoneId, callback) {
  async.waterfall([
    function(callback){
      console.log('balance e-wallet' + sessionid);
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

            callback(null,sessionid,response.additionalInfo.current);
          }
        });
      });
    },
    function(sessionid,currentMoney, callback){
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
    function(response,callback){
      var message = {};
      var condiciones = { 'phoneID': phoneId , message:{ $ne: '' }  ,  $and:[ { type : { $ne : 'REQUEST_MONEY' } } , { type : { $ne : 'GIFT' }}, {status:'NOTREAD'}] } ;
      Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs){
          //response.additionalInfo.messages = msgs;
          response.additionalInfo.unreadMsgs = msgs.length;
          callback(null, response);
        }
      });
    },
    ], function (err, result) {
      console.log('Return Balance');
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};
