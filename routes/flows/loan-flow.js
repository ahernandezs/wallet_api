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
    var forResult = {};
    forResult.additionalInfo = {};
  var additionalInfo;
  async.waterfall([
    function(callback) {
        console.log( 'Find loans for this user' );
        loanQuery.findUserLoans(payload.body.phoneID, function(err, result) {
            console.log(result);
           if (err)
               callback('ERROR', { statusCode : 1, additionalInfo : result.message });
            else
                callback(null, payload.header['x-auth-token']);
        });
    },
    function(sessionid, callback) {
        console.log( 'Getting balance for this user' );
        var request = { sessionid: sessionid, type: 1  };
        var request = {balanceRequest: request};
        soap.createClient(soapurl, function(err, client) {
            client.balance(request, function(err, result) {
                if(err) {
                    return new Error(err);
                } else {
                    var response = result.balanceReturn;
                    console.log(JSON.stringify(response));
                    if(response.result  === '0' && response.current === '0')
                        callback(null);
                    else {
                        var response = { statusCode: 1 , additionalInfo : 'You can not request a loan' };
                        callback('ERROR', response);
                    }
                }
            });
        });
    },
    function(callback){
      console.log('saving loan in DB');
      var loan = payload.body;
      var merchantID = loan.merchantID;
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loan.status = config.loans.status.NEW;
      loan.customerImage = config.S3.url + loan.phoneID +'.png';
      console.log(loan);
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
      messageQuery.createMessage(null,loan, function(err, result) {
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
        forResult.additionalInfo._id = loan._id;
      var message = config.messages.loanRequestMsg + loan.amount;
      loan.message = message;
      var extraData = { action : config.messages.action.LOAN , loan : JSON.stringify(loan.additionalInfo) };
      additionalInfo = extraData.loan;
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
          receipt.message = "You have received a loan of € "+ receipt.amount;
          receipt.additionalInfo = additionalInfo;
          receipt.title = receipt.message;
          receipt.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
          receipt.type = 'LOAN';
          receipt.status = 'NEW';
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
                console.log( 'response: ' + JSON.stringify(forResult) );
              callback(null, forResult);
            }
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
      messageQuery.createMessage(null,loan, function(err, result) {
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

     /* function(balance,receipt, callback) {
        console.log( 'Create History transacction' );
        var transacction = {};
        transacction.title = 'Transfer Fund ';
        transacction.type = 'MONEY',
        transacction.date = dateTime;
        transacction.amount = (-1) * receipt.amount;
        transacction.additionalInfo = receipt.additionalInfo;
        transacction.operation = 'LOAN';
        transacction.phoneID = receipt.emitter;
        Userquery.findAppID(receipt.receiver,function(err,result){
          transacction.description ='To ' + result.name;
          transacctionQuery.createTranssaction(transacction, function(err, result) {
            if (err)
              callback('ERROR', err);
            else{
              console.log('Creando transacction');
              callback(null, balance);
            }
          });
        });
      },*/
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
