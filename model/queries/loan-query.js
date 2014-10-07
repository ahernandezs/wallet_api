var Loan = require('../loan');
var config = require('../../config.js');

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
};

exports.updateLoan = function(loan, callback) {
    console.log( 'Verifying loan in MongoDB' );
    Loan.find({ '_id' : loan._id }, '_id customerImage customerName status date', function(err, loans){
        if (err) callback('ERROR', { statusCode: 1,  message: 'Something went wrong' } );
        else if (loans.length === 0)
            callback('ERROR', { statusCode: 1,  message: 'Failed Update (no loan found)' } );
        else {
            console.log( 'updateLoan in MongoDB with ID: ' + loan._id + ". New status: " + loan.status );
            var conditions = loan._id;
            delete loan._id;
            Loan.update( conditions, loan, null, function(err, result) {
                if (err) callback('ERROR', { statusCode: 1,  message: 'Failed Update' } );
                callback( null, { statusCode: 0 ,  additionalInfo: 'Successful Update' } );
            });
        }
    });
};

exports.CreateLoan = function(loan,callback){
  console.log("Saving Loan in MongoDB");
  console.log(loan);
  var loanToPersist = new Loan(loan);
  loanToPersist.save(function (err,result) {
    if(err)
        callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to persist loan' });
    else{
        console.log('Loan persisted correctly' + result._id);
        callback(null, result._id);
    }
  });
};
