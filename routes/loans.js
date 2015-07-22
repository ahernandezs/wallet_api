var mongoose = require('mongoose');
var async = require('async');
var loan = require('./flows/loan-flow');
var loanQuery = require('../model/queries/loan-query');

var urbanService = require('../services/notification-service');
var config = require('../config.js');
var logger = config.logger;

exports.getLoans = function(req, res) {
    console.log('POST method getLoans');
    loanQuery.getLoans(req.body.merchantID, function(err, result) {
        res.json(result);
    });
};

exports.updateLoan = function(req, res) {
    console.log('PUT method update Loan');
    console.log( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    loan.updateLoanFlow(payload, function(err, result) {
        res.json(result);
    });
};

exports.createLoan = function(req, res) {
    logger.info('POST method create Loans');
    logger.info( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    loan.createLoanFlow(payload, function(err, result) {
        res.json(result);
    });
};
