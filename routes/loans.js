var mongoose = require('mongoose');
var async = require('async');
var Loan = require('../model/loan');
var Loanquery = require('../model/queries/loan-query');
var urbanService = require('../services/urban-service');

exports.getLoans = function(req, res) {
    console.log('POST method getLoans');
    console.log( req.body );
    Loanquery.getLoans(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.updateLoan = function(req, res, callback) {
    async.waterfall([
        function(callback) {
            console.log('POST method updateLoan');
            console.log( req.body );
            var id = req.body._id;
            req.body.id = id;
            Loanquery.updateLoan(req.body, function(err, result) {
                if (err) {
                    res.json(result);
                    callback(err + ": " + result.message);
                } else if (result.statusCode === 0)
                    callback(null, req.body);
            });
        },
        function(loan, callback) {
            var message = 'Hi ' + loan.customerName + ', your loan request with ID: ' + loan.id + ' was ' + loan.status + '.';
            loan.message = message;
            urbanService.singlePush(loan, function(err, result) {
                res.json(result);
            });
        }
    ], function(err, result) {
        if (err) console.log(err)
        else
            console.log(result);
    });
};
