var transacctionQuery = require('../model/queries/transacction-query');

exports.getTransacctionsHistory = function(req,res){
  console.log('execute GET method getTransacctionsHistory');
  transacctionQuery.getTransacctions('phoneID',function(err,result){
      if(err) {
        res.send(500);
      } else {
        var response = { total: 10 , date : result[0].date , transacctions: result };
        console.log(response);
        res.json(response);
      }
  });
};

exports.getTransacctionsDox = function(req,res){
  console.log('execute GET method getTransacctionsDox');
    transacctionQuery.getTransacctionsDox('phoneID',function(err,result){
      if(err) {
        res.send(500);
      } else {
        console.log(result);
        var response = { total: 10 , date : result[0].date , transacctions: result };
        console.log(response);
        res.json(response);
      }
  });
};
