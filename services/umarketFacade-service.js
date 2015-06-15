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
        callback(null, result);
      }
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
        callback(null, result);
      }
    });
  });
}

/**
  Invoke Umarket transfer operation betwen 2 customers .
**/
exports.transfer = function(sessionid,payload,callback){
  var requestSoap = { sessionid: sessionid, to: payload.to, amount : payload.order.total , type: payload.transferRequest.type };
  var request = { transferRequest: requestSoap };
  soap.createClient(soapurl, function(err, client) {
    client.transfer(request, function(err, result) {
      if(err) {
      return new Error(err);
      } else {
        callback(null, result);
      }
    });
  });
}

/*
 *Create session
 */

exports.createSession = function(callback){
  var response = null;
  soap.createClient(soapurl, function(err, client) {
    client.createsession({}, function(err, result) {
      if(err) {
        logger.error(err);
        var response = { statusCode:1 ,  additionalInfo : err };
        callback(err,response);
      } else {
        var response = result.createsessionReturn;
        callback(null, response.sessionid);
      }
    });
  });
}

/*
 *Login
 */

exports.login = function(sessionid, payload, hashpin, callback){
  var  request = { sessionid: sessionid, initiator: payload.phoneID , pin: hashpin  };
  var request = {loginRequest: request};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
      if(err) {
        return new Error(err);
      } else {
        var response = result.loginReturn;
        logger.info(response);
        if(response.result  === 0 )
          var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
        else
          var response = { statusCode:1 ,  additionalInfo : response };

        callback(null,sessionid);
      }
    });
  });
}

/*
 *Register
 */
exports.register = function( sessionid,payload, callback){
  var requestSoap = { sessionid:sessionid, agent: payload.phoneID, name : payload.name , email_address: payload.email_address };
  var request = { registerRequest: requestSoap };
  console.log(request);
  soap.createClient(soapurl, function(err, client) {
    client.register(request, function(err, result) {
      if(err) {
        console.log(err);
        return new Error(err);
      } else {
        console.log(result);
        var response = result.registerReturn;
        if(response.result != 0){
          if (response.result === 18) {
            transfer = false;
            callback(null,sessionid);
          } else {
            var response = { statusCode:1 ,  additionalInfo : result };
            callback("ERROR", response);
          }
        }
        else {
          callback(null,sessionid);
        }
      }
    });
  });
}

/*
 * Reset PIN
 */

exports.resetPin = function (sessionid, payload, callback){
  var requestSoap = { sessionid:sessionid, new_pin: payload.pin , agent: payload.phoneID, suppress_pin_expiry:'true' };
  var request = { resetPinRequestType: requestSoap };
  console.log(request);
  soap.createClient(soapurl, function(err, client) {
    client.resetPin(request, function(err, result) {
      if(err) {
        console.log(err);
        return new Error(err);
      } else {
        console.log(result);
        var response = { statusCode:0 ,  additionalInfo : result.resetPinReturn };
        callback(null, sessionid);
      }
    });
  });
}

/*
 *Login 2
 */

exports.loginTransferFlow = function(sessionid, hashpin, callback){
  var request = { sessionid: sessionid, initiator: config.username, pin: hashpin };
  var request = {loginRequest: request};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
      if(err) {
        console.log('Error' + err);
        return new Error(err);
      } else {
        var response = result.loginReturn;
        callback(null,sessionid);
      }
    });
  });
}