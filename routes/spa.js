var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var config = require('../config.js');
var logger = config.logger;
var User = require('../model/user');
var Transaction = require('../model/transacction');
var Receipt = require('../model/receipt');
var Loan = require('../model/loan');

exports.getUsers = function(req, res) {
    logger.info( 'Getting all the users' );
    User.find( {}, 'OS company doxs email facebook group name phoneID twitter profileCompleted', { sort : { lastSession : -1 } }, function(err, users) {
        if (err)
            res.json( { statusCode : 1, additionalInfo : 'There was an error' } );
        else
            res.json( { statusCode : 0, additionalInfo : users } );
    });
};

exports.getTransactions = function(req, res) {
    var phoneID = req.param('phoneID');
    var type = req.param('type').toUpperCase();
    var conditions = { 'phoneID' : phoneID, 'type' : type };
    console.log( 'Getting ' + type + ' Transactions for user: ' + phoneID );
    Transaction.find( conditions, 'title type date amount operation description', { sort : { date : -1 } }, function(err, trans) {
       if (err)
           res.json( { statusCode : 1, additionalInfo : 'There was an error' } );
        else
            res.json( { statusCode : 0, additionalInfo : trans } );
    });
};

exports.getReceipts = function(req, res) {
    var phoneID = req.param('phoneID');
    console.log( 'Getting Receipts for user: ' + phoneID );
    Receipt.find( { 'emitter' : phoneID }, 'amount date type status receiver', { sort : { date : -1 } }, function(err, receipts) {
        if (err)
            res.json( { statusCode : 1, additionalInfo : 'There was an error' } );
        else
            res.json( { statusCode : 0, additionalInfo : receipts } );
    });
};

exports.getLoans =  function(req, res) {
    var phoneID = req.param('phoneID');
    console.log( 'Getting Loans for user: ' + phoneID );
    Loan.find( { 'phoneID' : phoneID }, 'amount date status merchantID', { sort : { date : -1 } }, function(err, loans) {
        if (err)
            res.json( { statusCode : 1, additionalInfo : 'There was an error' } );
        else
            res.json( { statusCode : 0, additionalInfo : loans } );
    });
};
