var soap = require('soap');
var crypto = require('crypto');
var soapurl = process.env.SOAP_URL;

/**
  Invoke Umarket balance operation for get current e-wallet money .
**/
exports.balanceMoney = function(sessionid,callback){
  var request = { sessionid: sessionid, type: 1  };
  var request = {balanceRequest: request};
  soap.createClient(soapurl, function(err, client) {
    client.balance(request, function(err, result) {
      if(err) {
      return new Error(err);
      } else {
          callback(null,result);
    });
  });
}

/**
  Invoke Umarket balance operation for get current points .
**/
exports.balancePoints = function(sessionid,callback){
  var request = { sessionid: sessionid, type: 3  };
  var request = {balanceRequest: request};
  soap.createClient(soapurl, function(err, client) {
    client.balance(request, function(err, result) {
      if(err) {
      return new Error(err);
      } else {
          callback(null,result);
    });
  });
}

/**
  Invoke Umarket transfer operation betwen 2 customers .
**/
exports.transfer = function(sessionid,payload,callback){
  var requestSoap = { sessionid: sessionid, to: payload.to, amount : payload.order.total , type: 1 };
  var request = { transferRequest: requestSoap };
  soap.createClient(soapurl, function(err, client) {
    client.transfer(request, function(err, result) {
      if(err) {
      return new Error(err);
      } else {
          callback(null,result);
    });
  });
}
