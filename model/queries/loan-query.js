var Loan = require('../loan');
var utils = require('../../utils/convert');
var config = require('../../config.js');
var moment = require('moment-timezone');
var logger = config.logger;

exports.getLoans = function(merchantID, callback) {
    console.log( 'getLoans from MongoDB with status: ' + config.loans.status );
    Loan.find({ 'merchantID': merchantID , 'status': config.loans.status.NEW }, '_id amount customerImage customerName status date', function(err, loans)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.loans.errMsg };
            callback("ERROR: " + err.message, response);
            logger.error(err.message);
        } else if (loans.length === 0) {
            response = { statusCode: 0, additionalInfo: config.loans.emptyMsg }
            callback(null, response);
            logger.warn(config.loans.emptyMsg);
        } else {
            response = { statusCode: 0, additionalInfo: loans };
            callback(null, response);
            logger.info( utils.JSONtoString(response) );
        }
    });
};

exports.updateLoan = function(loan, callback) {
    console.log( 'updateLoan in MongoDB with ID: ' + loan._id + ". New status: " + loan.status );
    var conditions = { _id : loan._id };
    delete loan._id;
    Loan.update( conditions, loan, null, function(err, result) {
        if (err) callback('ERROR', { statusCode: 1,  message: 'Failed Update' } );
        callback( null, { statusCode: 0 ,  additionalInfo: 'Successful Update' } );
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
        console.log('Loan persisted correctly ' + result._id);
        callback(null, result._id);
    }
  });
};

exports.getLoan = function(loanID,callback){
  console.log("Get Loan in MongoDB");
  console.log(loanID);
  Loan.find({ _id:loanID }, 'amount phoneID', function(err, loans) {
    var response;
    if (err) {
        response = { statusCode: 1, additionalInfo: config.loans.errMsg };
        console.log(response);
        callback("ERROR: " + err.message, response);
    } else if (loans.length === 0) {
        response = { statusCode: 0, additionalInfo: config.loans.emptyMsg }
        console.log(response);
        callback(null, response);
    } else {
        console.log(loans[0]);
        callback(null, loans[0]);
    }
   });
};

exports.findUserLoans = function(phoneID, callback) {
    Loan.find( { "phoneID" : phoneID, "status" : "ACCEPTED" }, function(err, loans) {
        if (err)
           callback('ERROR', { message : 'Something went wrong' });
        
        try {
            var lastLoan = loans[ loans.length -1 ];
            var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
            var startDate = moment( lastLoan.date, 'YYYY-M-DD HH:mm:ss' );
            var endDate = moment( dateTime, 'YYYY-M-DD HH:mm:ss' );
            var difference = endDate.diff(startDate, 'minutes');
            console.log(difference + ' minutes');

            if (difference < 30)
                callback('STOP', { message : config.messages.loanRejectedOneMsg + (30 - difference) + config.messages.loanRejectedTwoMsg });
            else
                callback(null, loans);
        } catch (e) {
            console.log(e);
            callback(null, loans);
        }
    });
};
