/**
 * Created by nemux on 21/10/15.
 */

var topupFlow = require('./flows/topup-flow');
var config = require('../config');

exports.buy = function (req, res){
    var payload = {};
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid  = req.headers['x-auth-token'];
    payload.amount = req.body.amount;
    payload.dox = req.body.dox;

    if (!payload.amount){
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

    if (payload.amount <= 0){
        res.send({statusCode: 10, additionalInfo : { message : 'CANNOT TOPUP NEGATIVE AMOUNT' }});
        return;
    }

    payload.message = "You add a Topup of " + config.currency.symbol + payload.amount ;

    topupFlow.buy(payload,function(err, result){
        if(err){
            //var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(result);
        } else {
            //var response = { statusCode:0 ,  additionalInfo : result };
            res.json(result);
        }
    });
};
