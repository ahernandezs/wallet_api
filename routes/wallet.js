var mongoose = require('mongoose');
var User = require('../model/user');
var soap = require('soap');
var async = require('async');
var BuyFlow = require('./flows/buy-flow');
var TransferFlow = require('./flows/transfer-flow');
var GiftFlow = require('./flows/gift-flow');
var balance = require('./flows/balance-flow');
var doxsService = require('../services/doxs-service');
var receipt = require('../model/queries/receipt-query');
var sessionQuery = require('../model/queries/session-query');
var doxInfoQuery = require('../model/queries/catalog-query');
var transacctionQuery = require('../model/queries/transacction-query');
var Userquery = require('../model/queries/user-query');
var soapurl = process.env.SOAP_URL;
var config = require('../config.js');

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

exports.balance = function(request, callback) {
    console.log('execute POST method balance');
    var req = { balanceRequest: request };
    console.log(request);
    soap.createClient(soapurl, function(err, client) {
        client.balance(req, function(err, result) {
            if(err && result === undefined)
                callback( 'ERROR', err.message = 'Internal Server Error' );
            else {
                var response = result.balanceReturn;
                callback(null, response);
            }
        });
    });
};

exports.getBalance = function(req, res) {
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
  console.log(req.headers['x-auth-token']);
  var json = req.body;
  json['sessionid']= req.headers['x-auth-token'];
  BuyFlow.buyFlow(req.body,function(err,result){
    if(err) {
      res.send(500);
    } 
    //else 
      //console.log(result);
    //else if(result.statusCode === 0){
      //res.setHeader('X-AUTH-TOKEN', result.sessionid);
      //delete result.sessionid;
    //}
    res.json(result);
  });
};

exports.transferFunds = function(req, res) {
    console.log('POST method transferFunds' );
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
      /*function(resultBalance, callback){
        doxsService.saveDoxs(payloadoxs, function(err, result){
          console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
          callback(null, resultBalance);
        });
      },*/

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
    if(err) {
      console.log('Error');
      console.log(err);
      res.send(500);
    }
    console.log('Finish Gift');
    console.log(result);
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  })
};

exports.activity = function(req, res){
  console.log('\n\nExecute POST activity');
  console.log(JSON.stringify(req.body));

  var payload = req.body;
  var sessionid= req.headers['x-auth-token'];

  async.waterfall([

    function(callback){
      var result;
      doxsService.saveDoxs(req.body, function(err, result){
        callback(null, result);
      });
    },

    function(result, callback){
      var transacction = {};
      transacction.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      transacction.type = 'DOX',
      transacction.description = 'You had earned some doxs points for your social activity!'
      transacction.operation = payload.action + ' - ' + payload.socialNetwork;
      transacction.title =  payload.action + ' - ' + payload.socialNetwork;
      transacction.amount = payload.action == 'LINK' ? config.doxs.linking : config.doxs.social;
      sessionQuery.getCredentials(sessionid,function(err,user){
        transacction.phoneID = user.data.phoneID;
        transacctionQuery.createTranssaction(transacction, function(err, result) {
          callback(null, result);
        });
      });
    },

    function(result, callback){
      if(payload.action == "SHARED"){
        var carga = {};
        carga.id = payload.receiptid;
        carga.operation = payload.socialNetwork;
        receipt.updateReceipt(carga, function(err, result){
          callback(null, result);
        });
      }else{
        callback(null, result);
      }
    },

  ], function (err, result) {
    if(err){
      callback("Error! "+err,result);
    }else{
      res.json(result);
    }
  });

};


exports.getReceipts = function(req, res){
  console.log('\n\nExecute Get receipts');
  sessionToken = req.headers['x-auth-token'];
  sessionQuery.getCredentials(sessionToken,function(err,credential){
    console.log(credential);
    receipt.getReceipts(credential.data.phoneID, function(err, result){
      if(err) {
        console.log(err);
        res.send(500);
      } else {
          var response = { statusCode: 0, additionalInfo: result };
          res.json(response);
      }
    });
  });
}

exports.doxInfo = function(req, res) {
    console.log( 'GET method doxInfo' );
    doxInfoQuery.getDoxInfo( function(err, result) {
        if (err)
            res.json( {statusCode : 1, message: result} );
        else
            res.json( {statusCode : 0, additionalInfo: result} );
    });
};

exports.updateReceipt = function(req, res){
    console.log('PUT method updateReceipt');

    async.waterfall([

      //getting the idPhone with the receipt's id
      function(callback){
        receipt.getIdPhone(req.body, function(err, response){
            console.log('phone id: '+response);
            var phoneId = response
            callback(null, phoneId);
        });
      },

      //transfer doxs
      function(phoneId, callback){
        var payloadoxs = {phoneID: phoneId, action: req.body.operation, type: 3}
        console.log(payloadoxs);
        doxsService.saveDoxs(payloadoxs, function(err, result){
          console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
          if(err) {
            return new Error(err);
          } else {
            callback(null, phoneId);
          }
        });
      },

      //saving doxs in mongo
      function(phoneId, callback){
        var updateDoxs = {phoneID: phoneId, operation: req.operation};
        Userquery.putDoxs(updateDoxs, function(err,result){
          callback(null,phoneId);
        });
      },

      //change status of receipt
      function(res, callback){
        receipt.updateReceipt(req.body, function(err, result){
            console.log(result);
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

}
