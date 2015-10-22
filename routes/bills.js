/**
 * Created by nemux on 9/10/15.
 */

var mongoose = require('mongoose');
var User = require('../model/user');
var Bill = require('../model/bill');
var config = require('../config.js');
var payBillFlow = require('./flows/pay_bill-flow');
var urbanService = require('../services/notification-service');
var logger = config.logger;

exports.get_bill = function (req, res){

    var billId = req.params.id;

    console.log('execute GET method bill');
    console.log('{ "billId":' + billId + "}");

    if (!billId) {
        res.send({});
        return;
    }
    Bill.getBill(billId, function (err,bill) {
        if (err) {
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }
        if (!bill){
            res.send({statusCode: 7, additionalInfo : { message : 'CANNOT FOUND BILLID' }});
        }
        else {
            res.send({statusCode: 0, additionalInfo : { billInfo : bill }});
        }
    });
};

exports.pay_bill = function(req, res){

    var billId = req.body.billId;
    var phoneNumber = req.headers['x-phoneid'];

    logger.info('********** EXECUTING POST METHOD /api/bill/pay **************');
    logger.info('POST REQUEST BODY ->' + JSON.stringify(req.body));
    if (!billId && !phoneNumber) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

    Bill.getBill(billId, function (err,bill) {
        if (err) {
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }
        if (!bill){
            res.send({statusCode: 7, additionalInfo : { message : 'CANNOT FOUND BILLID' }});
        }
        else {
            //Pay Bill
            var payload = {}

            payload.sessionid = req.headers['x-auth-token'];
            payload.phoneID = req.headers['x-phoneid'];
            payload.bill = bill;
            payload.message = config.messages.billPayMsg + payload.bill.issuer + ' by ' + config.currency.symbol + payload.bill.total;

            payBillFlow.pay_bill(payload,function(err, result){
                if (err) {
                    res.send(result);
                    return;
                }
                res.send(result);
            });
        }
    });
};

exports.get_bill_with_push = function(req, res){
    var billId = req.params.id;


    console.log('execute GET method bill with PUSH');
    console.log('{ "billId":' + billId + "}");

    if (!billId) {
        res.send({});
        return;
    }
    Bill.getBill(billId, function (err,bill) {
        if (err) {
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }
        if (!bill){
            res.send({statusCode: 7, additionalInfo : { message : 'CANNOT FOUND BILLID' }});
        }
        else {
            payload = {};
            payload.phoneID = req.headers['x-phoneid'];
            payload.message = "Bill info received";
            var extraData = { action: config.messages.action.BILLPAYMENT , additionalInfo : {billPaymentInfo : bill }};
            payload.extra = { extra:extraData };
            console.log('Send push notification');
            console.log(payload);

            urbanService.singlePush(payload, function(err, result) {
                if (err) {
                    res.send({statusCode: 1, additionalInfo : { message : "UNAVAILABLE PUSH SERVICE" }});
                    return;
                }
                res.send({statusCode: 0, additionalInfo : { billPaymentInfo : bill, pushNotificationInfo: result }});
            });
        }
    });
};