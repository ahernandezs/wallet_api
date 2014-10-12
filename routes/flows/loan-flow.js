var async = require('async');
var soap = require('soap');
var loanQuery = require('../../model/queries/loan-query');
var userQuery = require('../../model/queries/user-query');
var messageQuery = require('../../model/queries/message-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/urban-service');
var transfer = require('./transfer-flow');
var config = require('../../config.js');
var soapurl = process.env.SOAP_URL;
var ReceiptQuery = require('../../model/queries/receipt-query');

exports.createLoanFlow = function(payload,callback) {
    var forReceipt = {};
  async.waterfall([
    function(callback) {
        console.log( 'Find loans for this user' );  
    },
    function( callback){
      console.log('saving loan in DB');
      var loan = payload.body;
      var merchantID = loan.merchantID;
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loan.status = config.loans.status.NEW;
      loan.customerImage = config.S3.url + loan.phoneID +'.png';
      console.log(loan);
      forReceipt.payload = payload.body;
        console.log('payload!: ' + JSON.stringify(forReceipt.payload));
      loanQuery.CreateLoan(loan, function(err,result){
        if(err){
          var response = { statusCode:1 ,  additionalInfo : err };
          callback("ERROR", response);
        }
        else{
          loan._id = result;
          callback(null,loan,merchantID);
        }
      });
    },
    function(loan,merchantID,callback){
      console.log('search merchant by phoneID');
      merchantQuery.getMerchanByID(merchantID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{
            console.log(result);
            loan.OS = result.OS;
            loan.appID = result.appID;
            console.log(loan);
            forReceipt.loan = loan;
            callback(null,loan);
          }
      });
    },
    function(loan,callback){
      console.log('search user by phoneID');
      userQuery.findUserByPhoneID(loan.phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{

            console.log(result);
            loan.name = result.name;
            loan.additionalInfo = JSON.stringify ({_id: loan._id , customerName : loan.name , customerImage : loan.customerImage , status: loan.status , date :loan.date });
            forReceipt.detail = loan;
            callback(null,loan);
          }
      });
    },
    function(loan,callback){
      console.log('Save message in DB');
      var title = config.messages.loanRequestMsg + loan.amount;
      loan.status = config.messages.status.NOTREAD;
      loan.type = config.messages.type.LOAN;
      loan.title = title;
      loan.message = title;
      console.log(loan);
      messageQuery.createMessage(loan, function(err, result) {
        if (err) {
          var response = { statusCode: 1, additionalInfo: result };
          callback('ERROR', response);
        } else {
          callback(null, loan);
        }
      });
    },
    function(loan,callback){
      loan.additionalInfo = JSON.stringify ({_id: loan._id , customerName : loan.name , customerImage : loan.customerImage , status: loan.status , date :loan.date });
      var message = config.messages.loanRequestMsg + loan.amount;
      loan.message = message;
      var extraData = { action : config.messages.action.LOAN , loan : JSON.stringify(loan.additionalInfo) };
      loan.extra = {extra : extraData} ;
      console.log(loan);
      urbanService.singlePush2Merchant(loan, function(err, result) {
        if(err){
          var response = { statusCode:1 ,  additionalInfo : 'Error to create loan' };
          callback('ERROR',response);
        }
        else{
          var response = { statusCode:0 ,  additionalInfo : 'Loan sent Successful ' };
          callback(null,response);
        }
      });
    },
      function(response, callback) {
        console.log( 'Create Receipt Transfer' );
          data = forReceipt;
          var receipt = {};
          receipt.emitter = data.payload.phoneID;
          receipt.receiver = 'merchant';
          receipt.amount = data.payload.amount;
          receipt.message = "You have send a loan of € "+ receipt.amount;
          receipt.title = receipt.message;
          receipt.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
          receipt.type = 'LOAN';
          receipt.status = 'NEW';
          console.log(receipt);
          ReceiptQuery.createReceipt(receipt, function(err, result) {
            if (err)
              callback('ERROR', result.message);
            else
              callback(null, response);
          }); 
      }
    ], function (err, result) {
      console.log(result);
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};

exports.updateLoanFlow = function(payload,callback){
  var loanID = payload.body._id;
  async.waterfall([
    function(callback) {
      var loan = payload.body;
      console.log(loan);
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loanQuery.updateLoan(loan, function(err, result) {
        if (err) {
          var response = { statusCode:1 ,  additionalInfo : err };
          callback('ERROR',err);
        } else if (result.statusCode === 0)
        var response = { statusCode:1 ,  additionalInfo : '' };
        callback(null,loan);
      });
    },

    function(loan,callback) {
      console.log('Complement information');
      console.log(loan);
      loanQuery.getLoan(loanID, function(err, result) {
        if (err) {
          console.log('Error al recuperar Loan');
          var response = { statusCode:1 ,  additionalInfo : err };
          callback('ERROR',err);
        } else{
          console.log('Recuperando Loan');
          var notification = {};
          notification.phoneID = result.phoneID;
          console.log(result);
          loan.amount = result.amount;
          loan.phoneID = result.phoneID;
          callback(null,notification,loan);
        }
      });
    },

    function(notification,loan,callback) {
      console.log('Performing transfer');
      console.log(loan);
      var payloadTransfer = { amount : loan.amount ,  phoneID : notification.phoneID };
      var payloadTransfer = { transferRequest : payloadTransfer };
      transfer.transferFlow(payloadTransfer,function(err,result) {
        if(err){
          var response = { statusCode:1 ,  additionalInfo : result };
          callback('ERROR',response);
        }
        else{
          var response = { statusCode:0 ,  additionalInfo : result };
          callback(null,notification,loan);
        }
      });
    },
    function(sessionid,loan,callback){
      console.log('Save message in DB');
      if(loan.status === config.loans.status.ACCEPTED){
        console.log('ACCEPTED');
        loan.message = 'Your loan for € ' + loan.amount + ' was accepted' ;
        loan.title = loan.message;
      }
      else{
        console.log('REJECTED');
        loan.message = config.messages.loanRejectedMsg;
        loan.title = 'Your loan for € ' + loan.amount + ' was rejected' ;
      }

      var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loan.additionalInfo = JSON.stringify({ _id : loanID , sender: 1 , status: loan.status ,date:dateTime });
      console.log('additionalInfo ....'+loan.additionalInfo);
      loan.status = config.messages.status.NOTREAD;
      loan.type = config.messages.type.LOAN;
      loan.date = dateTime;
      console.log(loan);
      messageQuery.createMessage(loan, function(err, result) {
        if (err) {
          var response = { statusCode: 1, additionalInfo: result };
          callback('ERROR', response);
        } else {
          callback(null, sessionid,loan);
        }
      });
    },
    function(notification,loan,callback) {
      notification.message = loan.title;
      var extraData = { action : 4 , loan : JSON.stringify(loan.additionalInfo) };
      notification.extra = {extra : extraData} ;
      console.log(notification);
      urbanService.singlePush(notification, function(err, result) {
        if(err){
          var response = { statusCode:1 ,  additionalInfo : result };
          callback('ERROR',response);
        }
        else{
          var response = { statusCode:0 ,  additionalInfo : result };
          callback(null,response);
        }
      });
    }
    ],  function (err, result) {
      console.log(result);
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};
