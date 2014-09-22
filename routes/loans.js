var mongoose = require('mongoose');
var Loan = require('../model/loan');
var Loanquery = require('../model/loanQueryBuilder');

exports.getLoans = function(req, res) {
    console.log('POST method getLoans');
    console.log( req.body );
    Loanquery.getLoans(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};