var transacctionQuery = require('../model/queries/transacction-query');
var TransferFlow = require('./flows/transfer-flow');
var sessionQuery = require('../model/queries/session-query');
var doxsService = require('../services/doxs-service');
var async = require('async');

exports.getTransacctionsHistory = function(req,res){
  console.log('execute GET method getTransacctionsHistory');
  console.log( req.headers['x-auth-token'] );
  req.headers.sessionid = req.headers['x-auth-token'];
    var request = { sessionid : req.headers.sessionid, phoneID : req.headers['x-phoneid'] };
  sessionQuery.getCredentials(request,function(err,result){
    if(!result.data){
      var response = { statusCode: 1, additionalInfo: result.message };
      res.json(response);
    }else{
      transacctionQuery.getTransacctions(result.data.phoneID,function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result[0] ){
            var response = { statusCode: 0, additionalInfo: result };
            res.json(response);
          }else{  
            var empty = [];
            result.additionalInfo = empty;
            res.json(result);
          }
        }
      });
    }
  });
};

exports.getTransacctionsDox = function(req,res){
  console.log('execute GET method getTransacctionsDox');
  console.log( req.headers['x-auth-token'] );
  req.headers.sessionid = req.headers['x-auth-token'];
    var request = { sessionid : req.headers.sessionid, phoneID : req.headers['x-phoneid'] };
  sessionQuery.getCredentials(request, function(err,result){
    if(!result.data){
      var response = { statusCode: 1, additionalInfo: result.message };
      res.json(response);
    }else{
      transacctionQuery.getTransacctionsDox(result.data.phoneID,function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result[0] ){ 
            var response = { statusCode: 0, additionalInfo: result };
            res.json(response);
          }else{
            var empty = [];
            result.additionalInfo = empty;
            res.json(result);
          }
        }
      });
    }
  });
};  

exports.getSocialFeeds = function(req, res) {
    req.body.sessionid = req.headers['x-auth-token'];

    req.body.phoneID = req.headers['x-phoneid'];
    
      transacctionQuery.getTransacctionsSocialFeed(function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result.length != 0 ){ 
            var response = result;
            res.json(response);
          }else{
            var empty = [];
            result.additionalInfo = empty;
            res.json(result);
          }
        }
      });
};


exports.getPendingPayments = function(req, res) {
  var phoneID = req.headers['x-phoneid'];
  transacctionQuery.getPendingTransacctions(phoneID,function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result.length != 0 ){
            var response = JSON.parse(JSON.stringify(result));
            for(var i = 0; i < response.length; i++){
                if (response[i].additionalInfo){
                    additionalInfo = response[i].additionalInfo;
                    delete response[i].additionalInfo;
                    response[i].additionalInfo = JSON.parse(additionalInfo);
                }
            }
            res.json(response);
          }else{
            var empty = [];
            result.additionalInfo = empty;
            res.json(result);
          }
        }
   });
};

exports.transferPendingPayment = function(req,res){
    console.log('Invoke method transferPendingPayment' );
    req.headers.sessionid = req.headers['x-auth-token'];
    req.headers.phoneID = req.headers['x-phoneid'];
    var values = {};
    values.body = req.body;
    values.header = req.headers;

    var payloadoxs = {phoneID: req.body.destiny, action:'gift'};
    async.waterfall([
      function(callback){
        TransferFlow.transferFunds(values, function(err, result) {
            if (result.statusCode === 0) {
                res.setHeader( 'x-auth-token', result.sessionid );
                delete result.sessionid;
            }
            callback(null, result);
        });
      },
      function(resultBalance, callback){
        doxsService.saveDoxs(payloadoxs, function(err, result){
          console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
          callback(null, resultBalance);
        });
      },
      function(resultBalance, callback){
          transacctionQuery.updatePendingPayment(req.body.transferPendingID , function(err, response){
          if(err) {
          res.send(500);
          } else {
            callback(null, resultBalance);
          } 
        });
      }
    ], function (err, result) {
      if(err){
        callback("Error! "+err,result);
      }else{
        res.json(result);
      }
    });
}
