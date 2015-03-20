var mongoose = require('mongoose');
var soap = require('soap');
var soapurl = process.env.SOAP_URL_MTS;

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
  console.log(req.body);
  var payload = req.body;
  console.log('---------------');
  var parameters = { params : [] };
  console.log(parameters.params);
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
  parameters.params.push({"item": ["claveVenta",'5555'] });//clave de venta
  parameters.params.push({"item": ["operador", "WALLET"] });// checar string
  parameters.params.push({"item": ["nombre", "WALLET"] }); //checar string
  parameters.params.push({"item": ["fiid", "B128"] });
  parameters.params.push({"item": ["indMedioAcceso", "03"] });
  var request = { arg0: parameters };
  console.log(JSON.stringify(request));

  soap.createClient(soapurl, function(err, client) {
    client.getVenta(parameters, function(err, result) {
      if(err) {
        console.log(err);
      } else {
        console.log(result); 
      }
    });
  });
};
