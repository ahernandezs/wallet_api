var transacctionQuery = require('../model/queries/transacction-query');
var sessionQuery = require('../model/queries/session-query');

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
