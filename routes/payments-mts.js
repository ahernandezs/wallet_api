var soap = require('soap');
var parseString = require('xml2js').parseString;
var random = require('node-random');
var soapurl = process.env.SOAP_URL_MTS;

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
  var payload = req.body;
  var parameters = { params : [] };
  var request = { arg0: parameters };

  //callback for generate random number
  random.numbers({
    "number": 1,
    "minimum": 1,
    "maximum":  999999999
  }, function(error, paymentKey) {
    if (error) throw error;
    console.log('ID generado ' + paymentKey);
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
              res.json(response);
            }
            //if exist a xml valid in response, convert to JSON this content .
            else{
              parseString((((result['soapenv:Envelope'])['soapenv:Body'])[0]['ventaResponse'])[0]['ventaReturn'][0]['_'], function (err, resultJSON) {
                if(resultJSON.Transaccion.ventaResponse[0].aprobada){
                  responsePayload = resultJSON.Transaccion.ventaResponse[0].aprobada;
                  response = {statusCode:0 , additionalInfo: responsePayload };
                  res.json(response);
                }else{
                  responsePayload = resultJSON.Transaccion.ventaResponse[0];
                  response = {statusCode:0 , additionalInfo: responsePayload };
                  res.json(response);
                }
              })
            }//end else valid response
          });

        }//end else if not exist error later invoke service

      });// end of callback for invoke getVenta service

    });// end of callback for create cliente SOAP

  });// end of callback for random number

};
