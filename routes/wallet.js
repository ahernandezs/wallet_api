var mongoose = require('mongoose');
var User = require('../model/user');
var soap = require('soap');
var async = require('async');
var BuyFlow = require('./flows/buy-flow');
var TransferFlow = require('./flows/transfer-flow');
var GiftFlow = require('./flows/gift-flow');
var balance = require('./flows/balance-flow');
var doxsService = require('../services/doxs-service');
var soapurl = process.env.SOAP_URL;

exports.sell =  function(req, res){
  console.log('execute POST method sell');
  console.log(req.body);
  var request = {sellRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.sell(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);

        var response = result.sell;
        res.json(response);
      }
    });
  });
};

exports.transfer =  function(req, res){
  console.log('execute POST method transfer');
  console.log(req.body);
  var request = {transferRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.transfer(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);

        var response = result.transfer;
        res.json(response);
      }
    });
  });
};

exports.buy =  function(req, res){
  console.log('execute POST method buy');
  console.log(req.body);
  var request = {transferRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.transfer(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);

        var response = result.transfer;
        res.json(response);
      }
    });
  });
};

exports.balance = function(req, res) {
  console.log('execute GET method balance');
  console.log( req.headers['x-auth-token'] );
  balance.balanceFlow(req.headers['x-auth-token'], function(err, result) {
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  });
};

exports.buyFlow = function(req, res){
  console.log('execute POST method buyFlow');
  console.log(req.body);
  console.log(req.headers['x-auth-token']);
  var json = req.body;
  json['sessionid']= req.headers['x-auth-token'];
  BuyFlow.buyFlow(req.body,function(err,result){
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  });
};

exports.transferFunds = function(req, res) {
    console.log('POST method transferFunds' );
    console.log(req.body);
    console.log(req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var values = {};
    values.body = req.body;
    values.header = req.headers;

    var payloadoxs = {phoneID: req.body.destiny, action:'gift'};
    async.waterfall([
      function(callback){
        TransferFlow.transferFunds(values, function(err, result) {
            if (result.statusCode === 0) {
                res.setHeader( 'x-auth-token', result.sessionid );
                delete result.sessionid;
            }
            callback(null, result);
        });
      },

      function(result, callback){
        doxsService.saveDoxs(payloadoxs, function(err, result){
          console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
          callback(null, result);
        });
      },

    ], function (err, result) {
      if(err){
        callback("Error! "+err,result);
      }else{
        res.json(result);
      }
    });
};

exports.sendGift = function(req, res){
  console.log('\n\nExecute POST Send Gift');
  var json = req.body;
  console.log(json);
  console.log(req.headers['x-auth-token']);
  json['sessionid']= req.headers['x-auth-token'];
  GiftFlow.sendGift(req.body, function(err,result){
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  })
};

exports.senddoxs = function(req, res){
  console.log('\n\nExecute POST Send Gift');
  console.log(JSON.stringify(req.body));
  doxsService.saveDoxs(req.body, function(err, result){
    console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
    res.json(result);
  });
};
