var mongoose = require('mongoose');
var rest = require('restler');
var soap = require('soap');
var url_base = process.env.REST_URL_BMX;


exports.login =  function(req, res){
  console.log('execute POST BMX login ');
  var payload = req.body;
  console.log('Payload'+JSON.stringify(payload));
  rest.post(url_base + '/login', {
      data: { usuario : payload.user,
              password : payload.password,
              referencia : '140-ABC83',
              concepto : 'Transfer funds to Wallet',
              monto: payload.amount },
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

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
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
        response = {statusCode:0, additionalInfo:data };
        res.json(response);
      }else{
        console.log(data);
        response = {statusCode:1, additionalInfo:data };
        res.json(response);
      }
    })
};
