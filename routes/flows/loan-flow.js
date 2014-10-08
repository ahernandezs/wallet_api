var async = require('async');
var soap = require('soap');
var loanQuery = require('../../model/queries/loan-query');
var userQuery = require('../../model/queries/user-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/urban-service');
var transfer = require('./transfer-flow');
var config = require('../../config.js');
var soapurl = process.env.SOAP_URL;

exports.createLoanFlow = function(payload,callback) {
  async.waterfall([
    function( callback){
      console.log('saving loan in DB');
      var loan = payload.body;
      var merchantID = loan.merchantID;
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loan.status = config.loans.status.NEW;
      loan.customerImage = config.S3.url + loan.phoneID +'.png';
      console.log(loan);
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
            var notification = {};
            notification.OS = result.OS;
            notification.appID = result.appID;
            console.log(notification);
            callback(null,loan,notification);
          }
      });
    },
    function(loan,notification,callback){
      console.log('search user by phoneID');
      userQuery.findUserByPhoneID(loan.phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{
            console.log(result);
            loan.name = result.name;
            callback(null,loan,notification);
          }
      });
    },
    function(loan,notification,callback){
      var message = 'You have received a loan of €' + loan.amount;
      notification.message = message;
      var extraData = { action : 3 , loan : JSON.stringify(loan) };
      notification.extra = {extra : extraData} ;
      console.log(notification);
      urbanService.singlePush2Merchant(notification, function(err, result) {
        if(err){
          var response = { statusCode:1 ,  additionalInfo : result };
          callback('ERROR',response);
        }
        else{
          var response = { statusCode:0 ,  additionalInfo : result };
          callback(null,response);
        }
      });
    },
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
  async.waterfall([
    function(callback) {
      var loan = payload.body;
      var loanID = loan._id;
      console.log(loan);
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loanQuery.updateLoan(loan, function(err, result) {
        if (err) {
          var response = { statusCode:1 ,  additionalInfo : err };
          callback('ERROR',err);
        } else if (result.statusCode === 0)
        var response = { statusCode:1 ,  additionalInfo : '' };
        callback(null,loan,loanID);
      });
    },

    function(loan,loanID,callback) {
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
      console.log('Do transfer for ');
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

    function(notification,loan,callback) {
      var message = 'Hi  your loan for €' + loan.amount + ' was ' + loan.status + '.';
      notification.message = message;
      var extraData = { action : 4 , loan : JSON.stringify(loan) };
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
