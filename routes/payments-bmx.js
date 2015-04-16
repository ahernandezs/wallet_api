var mongoose = require('mongoose');
var rest = require('restler');
var crypto = require('crypto');
var soap = require('soap');
var async = require('async');
var config = require('../config.js');
var url_base = process.env.REST_URL_BMX;
var soapurlUMarket = process.env.SOAP_URL;

/**
  Start login process and return  challenge for 2FA
  @Version 1.1
**/
exports.login =  function(req, res){
  console.log('execute POST BMX login ');
  var payload = req.body;
  console.log('Payload'+JSON.stringify(payload));
  rest.post(url_base + '/login', {
      data: { usuario : payload.user,
              password : payload.password,
              referencia : '140-ABC83',
              concepto : 'Transfer funds to Wallet',
              monto: '001' },
        }).on('complete', function(data, response) {
        if(data){
          console.log(data);
          response = {statusCode:0, additionalInfo:JSON.parse(data)};
          res.json(response);
        }else{
          response = {statusCode:1, additionalInfo:data};;
          res.json(response);
        }
    });
};

/**
  Receive response challenge after init login and return accounts collection .
**/
exports.challenge =  function(req, res){
  console.log('execute POST MTS challenge ');
  var payload = req.body;
  console.log('Payload'+JSON.stringify(payload));
  console.log('Request'+ JSON.stringify({ response: payload.response,
              session_set: JSON.stringify(payload.session_set) }));
   rest.post(url_base + '/challenge', {
      data: { session_set: JSON.stringify(payload.session_set),
              response: payload.response },
        }).on('complete', function(data, response) {
        if(data){
          console.log(data);
          response = {statusCode:0,additionalInfo:data};
          res.json(response);
        }else{
          response = {statusCode:1, additionalInfo:data};
          res.json(response);
        }
    });
};

/*
  Receive index account for load , do payment and return identifier for autorization about operation
*/
exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
  var responseBMX = {};

  async.waterfall([
    function(callback){
      console.log('Transfer in banamex ');
      var payload = req.body;
      console.log('Payload'+JSON.stringify(payload));
      console.log('Request'+ JSON.stringify({ cuenta_cargo: payload.charge_account,
                  session_set: JSON.stringify(payload.session_set) }));
      rest.post(url_base + '/pago', {
        data: { cuenta_cargo : payload.charge_account,
                session_set: JSON.stringify(payload.session_set) },
          }).on('complete', function(data, response) {
          if(data){
            console.log(data);
            if(Object.keys(data).length > 1){
              responseBMX = {statusCode:0, additionalInfo:data };
              callback(null);
            }else{
              responseBMX = {statusCode:1, additionalInfo:'Invalid challenge' };
              callback('ERROR',responseBMX);
            }
          }else{
            console.log(data);
            responseBMX = {statusCode:1, additionalInfo:data };
            callback('ERROR',responseBMX);
          }
      })
    },
    function(callback){
      console.log('Create Session');
      var response = null;
      soap.createClient(soapurlUMarket, function(err, client) {
        client.createsession({}, function(err, result) {
          if(err) {
             callback('ERROR',{statusCode:1 , additionalInfo: err });
          } else {
            console.log(result);
            var response = result.createsessionReturn;
            callback(null, response.sessionid);
          }
        });
      });
    },
    function(sessionid, callback){
      console.log('Create hashpin');
      var hashpin = config.username.toLowerCase() + config.pin ;
      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
      console.log(hashpin);
      callback(null, sessionid, hashpin);
    },
    function(sessionid, hashpin, callback){
      console.log('Login');
      var  request = { sessionid: sessionid, initiator: config.username, pin: hashpin  };
      var request = {loginRequest: request};
      soap.createClient(soapurlUMarket, function(err, client) {
        client.login(request, function(err, result) {
          if(err) {
            callback('ERROR',{statusCode:1 , additionalInfo: err });
          } else {
            var response = result.loginReturn;
            console.log(response);
            callback(null,sessionid);
          }
        });
      });
    },
    //do transfer un U-Market
    function(sessionid,callback){
      console.log('Transfer in wallet ');
      var requestSoap = { sessionid:sessionid, to: req.headers['x-phoneid'], 'amount' : req.body.amount , type: 1 };
      var request = { transferRequest: requestSoap };
      soap.createClient(soapurlUMarket, function(err, client) {
          client.transfer(request, function(err, result) {
              if(err) {
                  callback('ERROR',{statusCode:1 , additionalInfo: err });
              } else {
                  console.log(result);
                  var response = result.transferReturn;
                  if(response.result != 0){
                      var response = { statusCode:1 ,  additionalInfo : result };
                      callback("ERROR", response);
                  } else{
                      callback(null,responseBMX);
                  }
              }
          });
      });
    },
    ], function (err, result) {
      console.log('Finish Flow');
      if(err){
          console.log(result);
          res.json(err);
      }else{
          console.log(result);
          res.json(result);
      }
    });
};

  /**
    Destroy sesion from banamex , do this operation before process login/challenge .
  **/
  exports.logoutSession =  function(req, res){
  var payload = req.body;
  console.log('Payload'+JSON.stringify(payload));
  console.log('Request'+ JSON.stringify({ session_set: JSON.stringify(payload.session_set) }));
   rest.post(url_base + '/logout', {
      data: { session_set: JSON.stringify(payload.session_set) },
        }).on('complete', function(data, response) {
        if(data){
          console.log(data);
          response = {statusCode:0,additionalInfo:data};
          res.json(response);
        }else{
          response = {statusCode:1, additionalInfo:data};
          res.json(response);
        }
    });
  }
