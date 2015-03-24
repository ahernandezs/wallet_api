var soap = require('soap');
var addFundsWallet = require('./flows/funds-flow');

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
  var payload = req.body;
  payload.phoneID = req.headers['x-phoneid'];
  addFundsWallet.transferFundFromCard(payload,function(err,result){
   console.log(result);
    if(err)
        res.json(err);
    else
        res.json(result);
  });
};
