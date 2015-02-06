var async = require('async');
var soap = require('soap');
var moment = require('moment-timezone');
var loanQuery = require('../../model/queries/loan-query');
var userQuery = require('../../model/queries/user-query');
var messageQuery = require('../../model/queries/message-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/notification-service');
var transfer = require('./transfer-flow');
var transacctionQuery = require('../../model/queries/transacction-query');
var config = require('../../config.js');
var logger = config.logger;
var soapurl = process.env.SOAP_URL;
var ReceiptQuery = require('../../model/queries/receipt-query');

exports.createLoanFlow = function(payload,callback) {
  var forReceipt = {};
    var forResult = {};
    forResult.additionalInfo = {};
  var additionalInfo;
  async.waterfall([
    function(callback) {
        logger.info( 'Find loans for this user' );
        loanQuery.findUserLoans(payload.body.phoneID, function(err, result) {
            logger.info(result);
           if (err && err === 'ERROR')
               callback('ERROR', { statusCode : 1, additionalInfo : result.message });
            else if (err && err === 'STOP')
                callback( 'ERROR', { statusCode : 4, additionalInfo : result.message } );
            else
                callback(null);
        });
    },
    function(callback){
      logger.info('saving loan in DB');
      var loan = payload.body;
      var merchantID = loan.merchantID;
      loan.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
      loan.status = config.loans.status.NEW;
      loan.customerImage = config.S3.url + loan.phoneID +'.png';
      logger.info(loan);
      forReceipt.payload = payload.body;
        userQuery.findUserByPhoneID(loan.phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{
              loan.customerName = result.name;
              callback(null, loan, merchantID);
          }
      });
    },
      function(loan, merchantID, callback) {
          loanQuery.CreateLoan(loan, function(err,result){
            if(err) {
                var response = { statusCode:1 ,  additionalInfo : err };
                callback("ERROR", response);
            } else{
                loan._id = result;
                callback(null, loan, merchantID);
            }
        });
      },
    function(loan,merchantID,callback){
      logger.info('search merchant by phoneID');
      merchantQuery.getMerchanByID(merchantID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{
            logger.info(result);
            loan.OS = result.OS;
            loan.appID = result.appID;
            logger.info(loan);
            forReceipt.loan = loan;
            callback(null,loan);
          }
      });
    },
    function(loan,callback){
      logger.info('search user by phoneID');
      userQuery.findUserByPhoneID(loan.phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{

            logger.info(result);
            loan.name = result.name;
            loan.additionalInfo = JSON.stringify ({_id: loan._id , customerName : loan.name , customerImage : loan.customerImage , status: loan.status , date :loan.date });
            forReceipt.detail = loan;
            callback(null,loan);
          }
      });
    },
    function(loan,callback){
      loan.additionalInfo = JSON.stringify ({_id: loan._id, customerName : loan.name, customerImage : loan.customerImage, status: config.loans.status.NEW, date :loan.date });
        forResult.additionalInfo._id = loan._id;
      var message = config.messages.loanRequestMsg + loan.amount;
      loan.message = message;
      var extraData = { action : config.messages.action.LOAN , loan : JSON.stringify(loan.additionalInfo) };
      additionalInfo = extraData.loan;
      loan.extra = {extra : extraData} ;
      logger.info(loan);
      callback(null, loan);
    },
      function(loan, callback) {
        logger.info( 'Create Receipt Transfer' );
          data = forReceipt;
          var receipt = {};
          receipt.emitter = data.payload.phoneID;
          receipt.receiver = 'merchant';
          receipt.amount = data.payload.amount;
          receipt.message = "Has solicitado un préstamo por €"+ receipt.amount;
          receipt.additionalInfo = additionalInfo;
          receipt.title = receipt.message;
          receipt.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
          receipt.type = 'LOAN';
          receipt.status = 'NEW';
          receipt.loanID = loan._id;
          ReceiptQuery.createReceipt(receipt, function(err, result) {
            if (err)
              callback('ERROR', { statusCode : 1, additionalInfo : result.message });
            else {
                forResult.statusCode = 0;
                forResult.additionalInfo.type = 'LOAN';
                forResult.additionalInfo.title = 'Has solicitado  un préstamo';
                forResult.additionalInfo.date = receipt.date;
                forResult.additionalInfo.status = receipt.status;
                forResult.additionalInfo.amount = receipt.amount;
                console.log( 'response: ' + JSON.stringify(forResult) );
              callback(null, forResult, loan._id);
            }
          }); 
      },

      function(response, loanId, callback){

        var carga = {body:{"_id" : loanId, "status" : "ACCEPTED"}};

        updateLoanFlow(carga, function(err, result) {
          callback(null, result);
        });

      },


    ], function (err, result) {
      logger.info(result);
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};

var updateLoanFlow = exports.updateLoanFlow = function(payload,callback){
  var loanID = payload.body._id;
    var receiver;
    var tranStatus = payload.body.status;
    var dateTime =  moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
    var receiptID;
  async.waterfall([
    function(callback) {
      var loan = payload.body;
      logger.info(loan);
      loan.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
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
      logger.info('Complement information');
      logger.info(loan);
      loanQuery.getLoan(loanID, function(err, result) {
        if (err) {
          logger.info('Error al recuperar Loan');
          var response = { statusCode:1 ,  additionalInfo : err };
          callback('ERROR',err);
        } else{
          logger.info('Recuperando Loan');
          var notification = {};
          notification.phoneID = result.phoneID;
            receiver = result.phoneID;
          loan.amount = result.amount;
          loan.phoneID = result.phoneID;
          callback(null,notification,loan);
        }
      });
    },

    function(notification,loan,callback) {
        if ( loan.status === config.loans.status.ACCEPTED ) {
          logger.info('Performing transfer');
          logger.info(loan);
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
        } else {
            callback(null, notification, loan);
        }
    },
    function(sessionid,loan,callback){
      logger.info('Save message in DB');
      if( tranStatus === config.loans.status.ACCEPTED ){
        logger.info('ACCEPTED');
        loan.message = config.messages.loanAcceptedMsg;
        loan.title = loan.message;
      }
      else{
        logger.info('REJECTED');
        loan.message = config.messages.loanRejectedMsg;
        loan.title = 'Tu préstamo por €' + loan.amount + ' fue rechazado' ;
      }

      loan.additionalInfo = JSON.stringify({ _id : loanID , sender: 1 , status: loan.status ,date:dateTime });
      logger.info('additionalInfo ....'+loan.additionalInfo);
      loan.status = config.messages.status.NOTREAD;
      loan.type = config.messages.type.LOAN;
      loan.date = dateTime;
      logger.info(loan);
      messageQuery.createMessage(null,loan, function(err, result) {
        if (err) {
          var response = { statusCode: 1, additionalInfo: result };
          callback('ERROR', response);
        } else {
          callback(null, sessionid,loan,result._id);
        }
      });
    },
    function(notification,loan,idMessage,callback) {
      notification.message = loan.title;
      var extraData = { action : 4 , additionalInfo : loan.additionalInfo , _id:idMessage };
      notification.extra = {extra : extraData} ;
      logger.info(notification);
      urbanService.singlePush(notification, function(err, result) {
        if(err){
          var response = { statusCode:1 ,  additionalInfo : result.message };
          callback('ERROR',response);
        }
        else{
          var response = { statusCode:0 ,  additionalInfo : result };
          callback(null, response, loan);
        }
      })
    },
    function(response, loan, callback) {
        if ( tranStatus === config.loans.status.REJECTED )
            callback(null, response);
        else {
            logger.info( 'Create History transaction' );
            var transacction = {};
            transacction.title = 'Transferencia';
            transacction.type = 'MONEY',
            transacction.date = loan.date;
            transacction.amount = loan.amount;
            transacction.additionalInfo = loan.additionalInfo;
            transacction.operation = 'LOAN';
            transacction.phoneID = receiver;
            userQuery.findAppID(receiver,function(err,result){
              transacction.description ='De Stand AGS Nasoft';
              transacctionQuery.createTranssaction(transacction, function(err, result) {
                if (err)
                  callback('ERROR', err);
                else{
                  logger.info('Transaction created');
                  callback(null, response);
                }
              });
            });
        }
    },
    function(response, callback) {
        var search = { phoneID : receiver, type : 'LOAN', loanID : loanID };
        ReceiptQuery.getLastReceipt(search, function(err, result) {
            logger.info('receipt ' + JSON.stringify(result));
            if (err)
                callback('ERROR', result);
            else
                callback(null, result, response);
        });
    },
    function(receipt, response, callback) {
        logger.info('updating receipt');
        var update = {};
        update.date = dateTime;
        update.status = tranStatus;
        update.emitter = receipt.emitter;
        update.receiver = receipt.receiver;
        update.message = receipt.message;
        update.amount = receipt.amount;
        update.additionalInfo = receipt.additionalInfo;
        update.title = receipt.title;
        update.type = receipt.type;
        update.loanID = receipt.loanID;
        update._id = receipt._id;
        ReceiptQuery.updateReceipt(update, function(err, result) {
           if (err)
               callback('ERROR', { statusCode : 1, additionalInfo : result });
            else {
                callback(null, response);
            }
        });
    }
    ],  function (err, result) {
      logger.info(result);
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};
