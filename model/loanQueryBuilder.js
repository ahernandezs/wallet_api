var Loan = require('./loan');
var config = require('../model/config.js');

exports.getLoans = function(merchantID, callback) {
    console.log( 'getLoans from MongoDB with status: ' + config.loans.status );
    Loan.find({ 'merchantId': merchantID , 'status': config.loans.status }, '_id customerImage customerName status date', function(err, loans)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.loans.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (loans.length === 0) {
            response = { statusCode: 0, additionalInfo: config.loans.emptyMsg }
            callback(null, response);
            console.log(config.loans.emptyMsg);
        } else {
            response = { statusCode: 0, additionalInfo: loans };
            callback(null, response);
            console.log(response);
        }
    });
}