var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var uuid = require("uuid");
var userQuery = require('../model/queries/user-query')
var config = require('../config.js');
var soapurl = process.env.SOAP_URL_NEW;




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
  var loanDisburseRequest = {amount: payload.amount , borrower : phoneID , loan_id : uuid.v4()};
  userQuery.findUserByPhoneID(phoneID,function(err,user){
      if(err) {
        return callback('ERROR',err);
      } else {
        soap.createClient(soapurl, function(err, client) {
          client.setSecurity(new soap.WSSecurity( 'anzen_01','1234','PasswordDigest'));
          client.BuyTickets(loanDisburseRequest, function(err, result) {
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
