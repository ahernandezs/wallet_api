var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var config = require('../config.js');
var logger = config.logger;
var User = require('../model/user');
var Transaction = require('../model/transacction');

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
