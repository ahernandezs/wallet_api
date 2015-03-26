var soap = require('soap');
var async = require('async');
var crypto = require('crypto');
var parseString = require('xml2js').parseString;
var random = require('node-random');
var soapurl = process.env.SOAP_URL_MTS;
var soapurlUMarket = process.env.SOAP_URL;
var config = require('../../config.js');
var balance = require('./balance-flow.js');
var session = require('../../model/queries/session-query');

exports.transferFundFromCard =  function(payload,callback) {
  var parameters = { params : [] };
  var request = { arg0: parameters };
  var amount,response;
  var transactionMTS = false;
  var transactionWallet = false;

  async.waterfall([
    function(callback){
      console.log('Transfer in MTS ');
      //callback for generate random number
      random.numbers({
        "number": 1,
        "minimum": 1,
        "maximum":  999999999
      }, function(error, paymentKey) {
        if (error) throw error;
        console.log('ID generated ' + paymentKey);
        parameters.params.push({"item": ["modoEntrada", "01"] });
        parameters.params.push({"item": ["capacidadPin", "1"] });
        parameters.params.push({"item": ["conditionCode", "01"] });
        parameters.params.push({"item": ["capacidadTerminal", "1"] });
        parameters.params.push({"item": ["ubicacionTerminal", "3"] });
        parameters.params.push({"item": ["importe", payload.amount] });
        parameters.params.push({"item": ["track2", payload.cardNumber + '=' + payload.expireDate ] });
        parameters.params.push({"item": ["cvv2", payload.cvc] });
        parameters.params.push({"item": ["afiliacion", "9165713"] });
        parameters.params.push({"item": ["numeroCaja", "1"] });
        parameters.params.push({"item": ["moneda", "484"] });
        parameters.params.push({"item": ["claveVenta",paymentKey] });//clave de venta
        parameters.params.push({"item": ["operador", "WALLET"] });// checar string
        parameters.params.push({"item": ["nombre", "WALLET"] }); //checar string
        parameters.params.push({"item": ["fiid", "B128"] });
        parameters.params.push({"item": ["indMedioAcceso", "03"] });

        console.log(JSON.stringify(parameters));
        //SET AMOUNT 
        amount  = payload.amount;
        //callback for create client SOAP to MTS service
        soap.createClient(soapurl, function(err, client) {

          //callback for getVenta service
          client.getVenta(request, function(err, resultPayment) {
            if(err) {
              console.log(err);
            } else {
              console.log('XML-result');
              console.log(resultPayment);

              parseString(resultPayment.return.switchResponse, function (err, result) {
                //validate if not exist xml in response, for this case ocurs a error
                if(err){
                  responsePayload = resultPayment.return.switchResponse;
                  response = {statusCode:1 , additionalInfo: responsePayload };
                  callback('ERROR',responsePayload);
                }
                //if exist a xml valid in response, convert to JSON this content .
                else{
                  parseString((((result['soapenv:Envelope'])['soapenv:Body'])[0]['ventaResponse'])[0]['ventaReturn'][0]['_'], function (err, resultJSON) {
                    if(resultJSON.Transaccion.ventaResponse[0].aprobada){
                      responsePayload = resultJSON.Transaccion.ventaResponse[0].aprobada[0];
                      response = {statusCode:0 , additionalInfo: responsePayload };
                      transactionMTS = true;
                      callback(null); 
                    }else{
                      responsePayload = resultJSON.Transaccion.ventaResponse[0];
                      response = {statusCode:0 , additionalInfo: responsePayload };
                      callback(null); 
                    }
                  })
                }//end else valid response
              });

            }//end else if not exist error later invoke service

          });// end of callback for invoke getVenta service

        });// end of callback for create cliente SOAP

      });// end of callback for random number
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
      var requestSoap = { sessionid:sessionid, to: payload.phoneID, 'amount' : amount , type: 1 };
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
                      callback(null,null);
                  }
              }
          });
      });
    },
    //do 
    /*function(callback){
      console.log('get balance ');
      session.getSession(payload.phoneID, function(err,result) {
        console.log('Obteniendo sesion');
         //if(err) {
          //  callback('ERROR',{statusCode:1 , additionalInfo: err });
          //} else {
            var request = {balanceRequest: { sessionid: result, type: 1 }};
            soap.createClient(soapurlUMarket, function(err, client) {
              client.balance(request, function(err, result) {
                if(err) {
                  console.log('Obteniendo sesion 3');
                  return callback('ERROR',{statusCode:1 , additionalInfo: err });
                } else {
                  console.log('Obteniendo sesion 4');               
                  /*var response = result.balanceReturn;
                  if(response.result  === 0 )
                    var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
                  else
                    var response = { statusCode:1 ,  additionalInfo : response }; 

                  callback(null,{});
                }
              });
            });
          //} 
        });
    },*/
    ], function (err, result) {
      console.log('Finish Flow');
      if(err){      
        callback(err,result);    
      }else{
          //response.additionalInfo = response;
          console.log(result);
          //response.additionalInfo.balance = result;
          callback(null,response);
      }  
    });
};


exports.transferFundsToWallet =  function(payload,callback) {

}
