var async = require('async');
var soap = require('soap');
var loanQuery = require('../../model/queries/loan-query');
var merchantQuery = require('../../model/queries/merchant-query');
var urbanService = require('../../services/urban-service');
var config = require('../../config.js');
var soapurl = process.env.SOAP_URL;

exports.createLoanFlow = function(payload,callback) {
  var loan = payload.body;
  var notification = {};
  var merchantID = loan.merchantID;
  async.waterfall([
    function( callback){
      console.log('saving loan in DB');
      console.log(loan);
      loanQuery.CreateLoan(loan, function(err,result){
        if(err){
          var response = { statusCode:1 ,  additionalInfo : err };
          callback("ERROR", response);
        }
        else{
          loan._id = result;
          callback(null);
        }
      });
    },
    function(callback){
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loan.customerImage = config.S3.url + loan.phoneID +'.png';
      loan.status = config.loans.status.NEW;
      console.log('search merchant by ID');
      merchantQuery.getMerchanByID(merchantID,function(err,result){
        if(err){
            var response = { statusCode:1 ,  additionalInfo : err };
            callback('ERROR',response);
          }
          else{
            console.log(result);
            notification.OS = result.OS;
            notification.appID = result.appID;
            console.log(notification);
            callback(null);
          }
      });
    },
    function(callback){
      var message = 'You have received a loan of $' + loan.amount;
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
  var loan = payload.body;
  var notification = {};
  async.waterfall([
    function(callback) {
      console.log('POST method updateLoan');
      console.log(loan);
      loan.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      loanQuery.updateLoan(payload, function(err, result) {
        if (err) {
          var response = { statusCode:1 ,  additionalInfo : err };
          callback('ERROR',err);
        } else if (result.statusCode === 0)
          var response = { statusCode:1 ,  additionalInfo : '' };
          callback(null, req.body);
      });
    },
    function(loan, callback) {
      var message = 'Hi  your loan request with ID: ' + loan.id + ' was ' + loan.status + '.';
      notification.message = message;
      var extraData = { action : 4 , loan : JSON.stringify(loan) };
      notification.extra = {extra : extraData} ;
      console.log(notification);
      urbanService.singlePush(loan, function(err, result) {
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
