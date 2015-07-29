var Loan = require('../loanLenddo');
var utils = require('../../utils/convert');
var config = require('../../config.js');
var moment = require('moment-timezone');

var logger = config.logger;

exports.saveLoan = function(payload, callback) {
    console.log( 'Save lendoLoan in MongoDB' );
      var loanToPersist = new Loan(payload);
      loanToPersist.save(function (err,result) {
        if(err)
            callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to persist loan' });
        else{
            console.log('Loan persisted correctly ' + result._id);
            callback(null, result._id);
        }
      });
}

exports.updateLoanPending = function(payload, callback) {
    console.log( 'Update lendoLoan in MongoDB ');
    console.log(payload);

    var conditions = { phoneID : payload.phoneID };
    Loan.update( conditions, payload, null, function(err, result) {
        if (err){
          console.log(err);
          callback('ERROR', { statusCode: 1,  message: 'Failed Update' } );
        }
        console.log( 'Finish lendoLoan ');
        console.log(result);
        callback( null, { statusCode: 0 ,  additionalInfo: 'Successful Update' } );
    });
}


exports.existPendingLoan = function(phoneID, callback) {
    console.log( 'Verify if there is  Loan ');
    Loan.findOne({ 'phoneID' : phoneID }, 'status maxLoanAmount', function(err, result)  {
        if(err)
            callback("ERROR",result);
        else
          callback(null,result);
    });
}

exports.loanRemove = function(phoneID,callback){
    console.log( 'Remove Lenddo Loan ');
    Loan.remove({ 'phoneID' : phoneID }, function(err, result)  {
        if(err)
            callback("ERROR",result);
        else{
          console.log(result);
          callback(null,result);
        }
    });

}
