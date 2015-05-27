var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var uuid = require("uuid");
var userQuery = require('../model/queries/user-query')
var config = require('../config.js');
var soapurl = process.env.SOAP_URL_NEW;
var moment = require('moment-timezone');




/**
	Function for invoke service Microlending
**/
exports.loanDisburse = function(payload,phoneID,callback) {
  var loanDisburseRequest = {amount: payload.amount , borrower : phoneID , loan_id : uuid.v4()};
  userQuery.findUserByPhoneID(phoneID,function(err,user){
      if(err) {
        return callback('ERROR',err);
      } else {
        soap.createClient(soapurl, function(err, client) {
          client.setSecurity(new soap.WSSecurity( 'anzen_01','1234','PasswordDigest'));
          client.LoanDisburse(loanDisburseRequest, function(err, result) {
            if(err) {
              console.log(err);
              if(err.body.indexOf('successful')  >= 0 )
                callback(null,'successful');
              else
                callback('ERROR',err);
            } else {
              console.log(result);
              callback(null,result);
            }
          });
        });
      }
    });
};



/**
  Function for invoke service Microlending
**/
exports.buyTickets = function(payload,phoneID,callback) {
  var date = new Date(moment().tz(process.env.TZ));
  var buyTicketsRequest = {amount: 1 , venue : payload.venue , seatsDetail : payload.seatsDetail , eventDate : '2012-11-04T14:51:06.157Z' };
  console.log(buyTicketsRequest);
  userQuery.findUserByPhoneID(phoneID,function(err,user){
      if(err) {
        return callback('ERROR',err);
      } else {
        soap.createClient(soapurl, function(err, client) {
          client.setSecurity(new soap.WSSecurity( phoneID, user.pin,'PasswordDigest'));
          client.BuyTickets(buyTicketsRequest, function(err, result) {
            if(err) {
              console.log(err);
              if(err.body.indexOf('successful')  >= 0 )
                callback(null,'successful');
              else
                callback('ERROR',err);
            } else {
              console.log(result);
              callback(null,result);
            }
          });
        });
      }
    });
};


/**
  Function for payment Service
**/
exports.paymentInsurance = function(payload,phoneID,callback) {
  var payInsuranceRequest = {amount: payload.amount , insurer : 'metlife' , policyNumber : payload.policyNumber};
  userQuery.findUserByPhoneID(phoneID,function(err,user){
      if(err) {
        return callback('ERROR',err);
      } else {
        soap.createClient(soapurl, function(err, client) {
          client.setSecurity(new soap.WSSecurity( phoneID, user.pin,'PasswordDigest'));
          client.PayInsurance(payInsuranceRequest, function(err, result) {
            if(err) {
              console.log(err);
              if(err.body.indexOf('successful')  >= 0 )
                callback(null,'successful');
              else
                callback('ERROR',err);
            } else {
              console.log(result);
              callback(null,result);
            }
          });
        });
      }
    });
};
