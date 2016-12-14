var mongoose = require('mongoose');
var User = require('../model/user');
var config = require('../config.js');
var airtimeFlow = require('./flows/airtime-flow');
var logger = config.logger;

exports.buy = function(req, res){

    var payload = {};
    payload.to = req.headers['x-phoneid'];
    payload.amount = req.body.amount;
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid = req.headers['x-auth-token'];
    payload.message = config.messages.airtimeBuyMsg  + config.currency.symbol + payload.amount;

    console.log('execute POST method Buy Airtime');
    console.log(payload);

    if (!payload.to && !payload.amount) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

    airtimeFlow.buy(payload, function(err, result){
        if (err) {
            res.send(result);
            return;
        }
        res.send(result);
    });
};


exports.topup = function(req, res){
    var payload = req.body;
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid = req.headers['x-auth-token'];

    console.log('execute POST method Buy Airtime for family or friend');
    console.log(payload);

    if (!payload.to && !payload.amount) {
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

    airtimeFlow.topup(payload, function(err, result){
        if (err) {
            res.send(result);
            return;
        }
        res.send(result);
    });
};