var transacctionQuery = require('../model/queries/transacction-query');
var sessionQuery = require('../model/queries/session-query');

exports.getTransacctionsHistory = function(req,res){
  console.log('execute GET method getTransacctionsHistory');
  console.log( req.headers['x-auth-token'] );
  req.headers.sessionid = req.headers['x-auth-token'];
  sessionQuery.getCredentials(req.headers.sessionid ,function(err,result){
    if(!result.data){
      var response = { statusCode: 1, additionalInfo: result.message };
      res.json(response);
    }else{
      transacctionQuery.getTransacctions(result.data.phoneID,function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result[0] ){
            var response = { total: result.length , date : result[0].date , transacctions: result };
            console.log(response);
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
  sessionQuery.getCredentials(req.headers.sessionid ,function(err,result){
    if(!result.data){
      var response = { statusCode: 1, additionalInfo: result.message };
      res.json(response);
    }else{
      transacctionQuery.getTransacctions(result.data.phoneID,function(err,result){
        if(err) {
          res.send(500);
        } else {
          if(result && result[0] ){ 
            var response = { total: result.length , date : result[0].date , transacctions: result };
            console.log(response);
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
