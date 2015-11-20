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
var loanLenddoQuery = require('../../model/queries/loanLenddo-query');
var config = require('../../config.js');
var logger = config.logger;
var soapurl = process.env.SOAP_URL;
var ReceiptQuery = require('../../model/queries/receipt-query');
var notificationService = require('../../services/notification-service');
var balanceServiceFlow = require('./balance-flow.js');

exports.createLoanFlow = function(payload,callback) {
  console.log('Create new Loan');
  console.log('Payload');  
  var forReceipt = {};
  var forResult = {};
  forResult.additionalInfo = {};
  var additionalInfo;
  async.waterfall([
    //TODO: check if there are curren loans
   /* function(callback) {
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
    },*/
    function(callback){
      logger.info('saving loan in DB');
      var loan = payload.body;
      var merchantID = 1;
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
      merchantQuery.getMerchantByID(merchantID,function(err,result){
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
            console.log(result);
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
          receipt.message = "You have requested a loan of €"+ receipt.amount;
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
                forResult.additionalInfo.title = 'You have requested a loan';
                forResult.additionalInfo.date = receipt.date;
                forResult.additionalInfo.status = receipt.status;
                forResult.additionalInfo.amount = receipt.amount;
              callback(null, forResult, loan._id);
            }
          }); 
      },

      function(response, loanId, callback){

        var carga = {body:{"_id" : loanId, "status" : "ACCEPTED"} , sessionID : payload.body.sessionID};

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
        loan.title = 'Your loan for '+config.currency.symbol +' '+ loan.amount + ' was rejected' ;
      }

      loan.additionalInfo = JSON.stringify({ _id : loanID , sender: 1 , status: loan.status ,date:dateTime });
      logger.info('additionalInfo ....'+loan.additionalInfo);
      loan.status = config.messages.status.NOTREAD;
      loan.type = config.messages.type.LOAN;
      loan.date = dateTime;
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
            transacction.title = 'Transfer fund';
            transacction.type = 'MONEY',
            transacction.date = loan.date;
            transacction.amount = loan.amount;
            transacction.additionalInfo = loan.additionalInfo;
            transacction.operation = 'LOAN';
            transacction.phoneID = receiver;
            userQuery.findAppID(receiver,function(err,result){
              transacction.description ='From amdocs Cafe';
              transacctionQuery.createTranssaction(transacction, function(err, result) {
                if (err)
                  callback('ERROR', err);
                else{
                  logger.info('Transaction created');
                  response.additionalInfo.transId = result.id;
                  callback(null, response);
                }
              });
            });
        }
    },
    function(response, callback) {
        var search = { phoneID : receiver, type : 'LOAN', loanID : loanID };
        ReceiptQuery.getLastReceipt(search, function(err, result) {
            logger.info('receipt ');
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
    },
    //Get current Balance
    function(response,callback){
      balanceServiceFlow.balanceFlow(payload.sessionID, function(err, result) {
        if(err){      
          callback(err,result);    
        }else{
          delete result.sessionid;
          callback(null,result);    
        } 
      });
    },
    ],  function (err, result) {
      logger.info(result);
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};


exports.getLenddoPendingLoans = function(phoneID,callback) {
  console.log('Get pending Loans  Lenddo');
  var response = {};

  var loan1 =  {"months": 3, "interest": 1.25 };
  var loan2 =  {"months": 6, "interest": 1.5 };
  var loan3 =  {"months": 12, "interest": 1.75 };

  async.waterfall([
  function(callback) {
     loanLenddoQuery.existPendingLoan(phoneID, function(err,result){
        if(err)
          callback("ERROR",err);

        //Verify if exist loan pending
        if(result){
          console.log(result);
          response.pending = 'YES';
          //response.maxLoanAmount = result.maxLoanAmount;
          response.maxLoanAmount = 1000;
        }else{
          response.pending = 'NO';
          response.maxLoanAmount = 0;
        }

        response.loan = [];
        response.loan.push(loan1);
        response.loan.push(loan2);
        response.loan.push(loan3);
        callback(null);
    });
  },
  function(callback) {
    loanQuery.getLoans(phoneID,function(err,result){
     if (err)
       callback('ERROR', { statusCode : 1, additionalInfo : err });
     else {
        response.loans = result;
        callback(null);
      }
    });
  }], function (err, result) {
    if(err){
      callback("ERROR",err);
    }else{
      callback(null,response);
    }
  }); 
}

exports.processLogin = function(payload) {
  console.log('processing login for Lenddo ');
  var timeStamp = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
  var payload = {phoneID: payload.client_id , date : timeStamp , status :payload.event}
  loanLenddoQuery.saveLoan(payload, function(err,result){
     if (err)
       callback('ERROR', { statusCode : 1, additionalInfo : err });
     else {
      callback(null, response);
    }
  });
}

exports.processHasScore = function(payload) {
  console.log('process has score event ' );
  console.log(payload);
  var transId = payload.client_id.split('_');
  var client_id = tansId[0];
  console.log(client_id);
  var event = payload.event;

  async.waterfall([
    function(callback){
      if(payload.event == 'has_score'){
        var score = payload.data.score;
        payload = {};
        payload.phoneID = client_id;
        payload.message = " Your MAX available loan is $";
        payload.score_type = config.loans.type.DEFAULT;
        payload.max_amount = config.loans.max_amount.DEFAULT;

        if (score >= 700 && score <= 999) {
          payload.score_type = config.loans.type.GREAT;
          payload.max_amount = config.loans.max_amount.GREAT;
        }
        else if (score >= 550 && score < 700) {
          payload.score_type = config.loans.type.GOOD;
          payload.max_amount = config.loans.max_amount.GOOD;
        }
        else if (score >= 450 && score < 550) {
          payload.score_type = config.loans.type.OK;
          payload.max_amount = config.loans.max_amount.OK;
        }
        else if (score >= 100 && score <= 300) {
          payload.score_type = config.loans.type.BAD;
          payload.max_amount = config.loans.max_amount.BAD;
        }
        payload.message = payload.message + payload.max_amount;

        var extraData = { action : config.messages.action.LENDO };
        payload.extra = {extra : extraData} ;

        notificationService.singlePush(payload, function(err, result) {
          if (err){
            callback('ERROR',err);
          }
          else{
            callback(null,result, payload.max_amount);
          }
        });
      }
    },
    function(result,max_amount,callback) {
      var timeStamp = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
      var payloadLenddo = {phoneID: client_id , date : timeStamp , status:event , maxLoanAmount : max_amount };
      loanLenddoQuery.updateLoanPending(payloadLenddo , function(err,forResult){
         if (err)
           callback('ERROR', { statusCode : 1, additionalInfo : err });
         else {
          callback(null,result);
        }
      });
    }

    ], function (err, result) {
      if(err){
        console.log('Error flow');
      }else{
        console.log('Finish flow');
        console.log(result)
      }
    });
}
  
