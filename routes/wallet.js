var mongoose = require('mongoose');
var moment = require('moment-timezone');
var User = require('../model/user');
var soap = require('soap');
var async = require('async');
var BuyFlow = require('./flows/buy-flow');
var TransferFlow = require('./flows/transfer-flow');
var GiftFlow = require('./flows/gift-flow');
var balance = require('./flows/balance-flow');
var doxsService = require('../services/doxs-service');
var couponService = require('../services/coupon-service');
var receipt = require('../model/queries/receipt-query');
var sessionQuery = require('../model/queries/session-query');
var doxInfoQuery = require('../model/queries/catalog-query');
var transacctionQuery = require('../model/queries/transacction-query');
var Userquery = require('../model/queries/user-query');
var soapurl = process.env.SOAP_URL;
var config = require('../config.js');
var logger = config.logger;

exports.sell =  function(req, res){
  console.log('execute POST method sell');
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
  logger.info('execute POST method buy');
  var request = {transferRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.transfer(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        logger.info(result);

        var response = result.transfer;
        res.json(response);
      }
    });
  });
};

exports.balance = function(request, callback) {
    console.log('execute POST method balance');
    console.log(request);
    var req = { balanceRequest: request };
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
  logger.info('execute POST method buyFlow');
  logger.info(req.headers['x-auth-token']);
  var json = req.body;
  json['sessionid']= req.headers['x-auth-token'];
  BuyFlow.buyFlow(req.body,function(err,result){
    if(err) {
      console.log(result);
    }
    res.json(result);
  });
};

exports.transferFunds = function(req, res) {
    console.log('POST method transferFunds' );
    req.headers.sessionid = req.headers['x-auth-token'];
    req.headers.phoneID = req.headers['x-phoneid'];
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
      function(resultBalance, callback){
        doxsService.saveDoxs(payloadoxs, function(err, result){
          console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
          callback(null, resultBalance);
        });
      }
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
      console.log(result);
    }
    console.log('Finish Gift');
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  })
};

exports.activity = function(req, res){
  console.log('\n\nExecute POST activity');
  var payload = req.body;
  var sessionid = req.headers['x-auth-token'];
  var phoneID = req.headers['x-phoneid'];
  payload.phoneID = phoneID;
  payload.sessionid = sessionid;
    var action = payload.action.substr(0, 1).toUpperCase() + payload.action.substr(1).toLowerCase();
    var socialNetwork = payload.socialNetwork.substr(0, 1).toUpperCase() + payload.socialNetwork.substr(1).toLowerCase();

  var actualizar = false;

  if(payload.action ==='SHARED' && payload.socialNetwork ==='SMS'){
      console.log('Sharing SMS for invite friends');
        async.waterfall([
        function(callback){
          Userquery.validateSMS(payload.phoneID,function(err,result){
            var operacion = payload.socialNetwork.toLowerCase();
            if(result === 5){
              actualizar = false;
              callback(null,operacion);
            }
            else{
              actualizar = true;
              updateMessage = { phoneID:payload.phoneID, sms : result+1 };
              Userquery.singleUpdateUser(updateMessage,function(err,result){
                callback(null,operacion);
              });
            }
          });
        },

      function(operacion, callback){
        if(actualizar){
          var payloadoxs = {phoneID: payload.phoneID, action: operacion, type: 3}
          console.log('Transfer Dox');
          doxsService.saveDoxs(payloadoxs, function(err, result){
            callback(null, operacion);
          });
        }else{
          callback(null, operacion);
        }
      },

      function(resultado, callback){
        if(actualizar){
          var operacion = payload.action;
          var updateDoxs = {phoneID: payload.phoneID, operation: operacion, sessionid: sessionid};
          console.log('Saving doxs in mongo');
          Userquery.putDoxs(updateDoxs, function(err,result){
            callback(null, resultado);
          });
        }else{
          callback(null, resultado);
        }
      },
      function(result, callback){
        if(actualizar){
          var transacction = {};
          transacction.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
          transacction.type = 'DOX',
          transacction.description = 'You had earned some doxs points for your social activity!'
          transacction.operation = action + ' - ' + payload.socialNetwork;
          transacction.title =  action + ' - ' + payload.socialNetwork;
          transacction.amount =  config.doxs.social;
          transacction.phoneID = payload.phoneID;
          transacctionQuery.createTranssaction(transacction, function(err, result) {
            callback(null, result);
          });
        }else{
            callback(null, result);
        }
      }
      ], function (err, result) {
        if(err){
          res.send(500);
        }else{
          console.log('Finish Flow');
          var response = { statusCode: 0, additionalInfo: result };
          res.json(response);
        }
      });
  } else {

  async.waterfall([

      function(callback){

        //Available values for operacion: 'linking', 'twitter' and 'facebook'
        var operacion = payload.action == 'LINK' ? 'linking' : payload.socialNetwork.toLowerCase();

        if(operacion==='linking'){
          //if 'linking' validate flag in user's record
          Userquery.getSocialNetworks(payload.phoneID, function(err, socialNetworksUsers){
            if(payload.socialNetwork.toLowerCase() == 'twitter' && (socialNetworksUsers.twitter == null || socialNetworksUsers.twitter == '0')){
              console.log('Set flag twitter in user');
              actualizar = true;
              var carga = {phoneID: payload.phoneID, social: 'twitter'};
              Userquery.setSocialNetworks(carga, function(err, result){
                callback(null, operacion);
              });
            }else if(payload.socialNetwork.toLowerCase() == 'facebook' && (socialNetworksUsers.facebook == null || socialNetworksUsers.facebook == '0')){
              console.log('Set flag facebook in user');
              actualizar = true;
              var carga = {phoneID: payload.phoneID, social: 'facebook'};
              Userquery.setSocialNetworks(carga, function(err, result){
                callback(null, operacion);
              });
            }else{
              callback(null, operacion);
            }
          });
        }else{
          //if 'shared' validate flag in receipt's record
          receipt.getSocialNetworks(payload.orderid, function(err, socialNetworksReceipt){
            if(payload.socialNetwork.toLowerCase() == 'twitter' && (socialNetworksReceipt.twitter == null || socialNetworksReceipt.twitter == '0')){
              actualizar = true;
            }else if(payload.socialNetwork.toLowerCase() == 'facebook' && (socialNetworksReceipt.facebook == null || socialNetworksReceipt.facebook == '0')){
              actualizar = true;
            }
            callback(null, operacion);
          });
        }
      },

      function(operacion, callback){
        if(actualizar){
          var payloadoxs = {phoneID: payload.phoneID, action: operacion, type: 3}
          doxsService.saveDoxs(payloadoxs, function(err, result){
            callback(null, operacion);
          });
        }else{
          callback(null, operacion);
        }
      },

      function(resultado, callback){
        if(actualizar){
          var operacion = payload.action == 'LINK' ? 'linking' : payload.socialNetwork.toLowerCase();
          var updateDoxs = {phoneID: payload.phoneID, operation: operacion, sessionid: sessionid};
          console.log('Saving doxs in mongo');
          Userquery.putDoxs(updateDoxs, function(err,result){
            callback(null, resultado);
          });
        }else{
          callback(null, resultado);
        }
      },

      function(result, callback){
        if(actualizar){
          var transacction = {};
          transacction.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
          transacction.type = 'DOX',
          transacction.description = 'You had earned some doxs points for your social activity!'
          transacction.operation = action + ' - ' + socialNetwork;
          transacction.title =  action + ' - ' + socialNetwork;
          transacction.amount = payload.action == 'LINK' ? config.doxs.linking : config.doxs.social;
          transacction.phoneID = payload.phoneID;
          transacctionQuery.createTranssaction(transacction, function(err, result) {
            callback(null, result);
          });
        }else{
            callback(null, result);
        }
      },

      function(result, callback){
        if(payload.action == "SHARED" && actualizar){
          var carga = {};
          carga.orderID = payload.orderid;

          if(payload.socialNetwork.toLowerCase() == 'twitter')
            carga.twitter = 1;
          else if(payload.socialNetwork.toLowerCase() == 'facebook')
            carga.facebook = 1;

          receipt.updateReceiptByOrder(carga, function(err, result){
            callback(null, result);
          });
        }else{
          callback(null, result);
        }
      },

    ], function (err, result) {
      if(err){
        res.send(500);
      }else{
        console.log('Finish Flow');
        var response = { statusCode: 0, additionalInfo: result };
        res.json(response);
      }
    });
  }
};

exports.getReceipts = function(req, res){
  console.log('\n\nExecute Get receipts');
  sessionToken = req.headers['x-auth-token'];
    var request = { sessionid : sessionToken, phoneID : req.headers['x-phoneid'] };
  sessionQuery.getCredentials(request, function(err,credential){
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
    logger.info( 'GET method doxInfo' );
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
        var updateDoxs = {phoneID: phoneId, operation: req.operation, sessionid: req.headers['x-auth-token']};
        Userquery.putDoxs(updateDoxs, function(err,result){
          callback(null,phoneId);
        });
      },

      //change status of receipt
      function(res, callback){
        receipt.updateReceipt(req.body, function(err, result){
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

exports.setCoupon = function(req, res){
  console.log('execute POST method setCoupon');
  var json = req.body;
  json['sessionid']= req.headers['x-auth-token'];
  couponService.setCoupon(json, function(err,result){
      if(err) {
        res.send(500);
      } else {
        res.json(result);
      }
  });
}
