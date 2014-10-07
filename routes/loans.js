var mongoose = require('mongoose');
var async = require('async');
var loan = require('./flows/loan-flow');
var loanQuery = require('../model/queries/loan-query');

var urbanService = require('../services/urban-service');

exports.getLoans = function(req, res) {
    console.log('POST method getLoans');
    console.log( req.body );
    loanQuery.getLoans(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.updateLoan = function(req, res, callback) {

};

exports.createLoan = function(req, res) {
    console.log('POST method create Loans');
    console.log(req.body);
    console.log( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    loan.createLoanFlow(payload, function(err, result) {
        res.json(result);
    });
};
