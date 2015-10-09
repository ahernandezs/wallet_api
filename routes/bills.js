/**
 * Created by nemux on 9/10/15.
 */

var mongoose = require('mongoose');
var User = require('../model/user');
var Bill = require('../model/bill');
var config = require('../config.js');
var logger = config.logger;

exports.get_bill =function (req, res){
    console.log('execute GET method bill');
    var billId = req.params.id;
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
