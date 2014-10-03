var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var soapurl = process.env.SOAP_URL;

exports.balanceFlow = function(sessionid,callback) {
  async.waterfall([
    function(callback){
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
