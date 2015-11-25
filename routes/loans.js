var mongoose = require('mongoose');
var async = require('async');
var loan = require('./flows/loan-flow');
var loanQuery = require('../model/queries/loan-query');
var cashCreditService = require('../services/cashCredit-Service');
var urbanService = require('../services/notification-service');
var transaction = require('../model/transacction');
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


exports.getDecision = function(req,res){
    logger.info('POST method get decision');
    var payload = req.body;
    payload.phoneID = req.headers['x-phoneid'];

    transaction.getLastTransaction(payload.phoneID, config.transaction.operation.LOAN, function(err,transaction){
        if (err){
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }

        if (!transaction){
            cashCreditService.requestDecision(payload, function(err,result) {
                if (err) {
                    console.log(err);
                    res.send(500);
                    return;
                } else {
                    console.log(result);
                    var mockResponse = {approved: 'YES',interestRate : result.INTERESTRATE[0], maxAmount: result.MAXAMOUNT[0], maxPeriod: 5};
                    var response = {statusCode: 0, additionalInfo: mockResponse}
                    res.json(response);
                    return;
                }
            });
        } else if ( ((new Date() - transaction.fecha)/1000) > 3600 ){
            cashCreditService.requestDecision(payload, function(err,result) {
                if (err) {
                    console.log(err);
                    res.send(500);
                } else {
                    console.log(result);
                    var mockResponse = {transId: result.transId, approved: 'YES' ,interestRate : result.INTERESTRATE[0] , maxAmount: result.MAXAMOUNT[0], maxPeriod: 5};
                    var response = {statusCode: 0, additionalInfo: mockResponse}
                    res.json(response);
                }
            });
        } else {
            res.send({statusCode: 14, additionalInfo : { message : 'ONLY 1 LOAN PER HOUR' }});
            return;
        }
    });
}

exports.loanConfirm = function(req,res){
    logger.info('POST METHOD LOAN CONFIRM');
    var payload = req.body;
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid  = req.headers['x-auth-token'];
    var amountLoan = payload.amount;

    if (!payload.phoneID && !payload.countryCode) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }
    cashCreditService.requestLoan(payload, function(err,result){
      if(err) {
          res.send({statusCode: 12, additionalInfo: {message: 'UNAVAILABLE CASHCREDIT SERVICE'}});
          return;
      } else {
          console.log('Invoke create Loan Flow');
          var bodyContent = { phoneID : req.headers['x-phoneid'] , amount : amountLoan , sessionID :  req.headers['x-auth-token'] };
          var payload = { body : bodyContent } ;
          console.log('Invoke create Loan Flow 2');
          console.log(payload);
          loan.createLoanFlow(payload, function(err, resultLoan) {
              resultLoan.additionalInfo.doxEarned  = result.doxEarned;
              res.json(resultLoan);
          });
      }
    });   
}