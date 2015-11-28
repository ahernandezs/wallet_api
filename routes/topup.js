/**
 * Created by nemux on 21/10/15.
 */

var topupFlow = require('./flows/topup-flow');
var config = require('../config');
var transaction = require('../model/transacction');

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
        res.send({statusCode: 10, additionalInfo : { message : 'Cannot topup negative amount' }});
        return;
    }

    payload.message = "You added a topup of " + config.currency.symbol + payload.amount;

    transaction.getLastTransaction(payload.phoneID, config.transaction.operation.TOPUP, function(err,transaction){
        if (err){
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }

        if (!transaction){
            topupFlow.buy(payload,function(err, result){
                if(err){
                    //var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
                    res.json(result);
                    return;
                } else {
                    //var response = { statusCode:0 ,  additionalInfo : result };
                    res.json(result);
                    return;
                }
            });
        } else if ( ((new Date() - transaction.fecha)/1000) > 3600 ){
            topupFlow.buy(payload,function(err, result){
                if(err){
                    //var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
                    res.json(result);
                    return;
                } else {
                    //var response = { statusCode:0 ,  additionalInfo : result };
                    res.json(result);
                    return;
                }
            });
        } else {
            res.send({statusCode: 11, additionalInfo : { message : 'Only 1 topup per hour' }});
            return;
        }
    });
};
