var mongoose = require('mongoose');
var rest = require('restler');
var soap = require('soap');
var url_base = process.env.REST_URL_BMX;


exports.login =  function(req, res){
  console.log('execute POST BMX login ');
  var payload = req.body;
  rest.post(url_base + '/login', {
    data: { usuario : payload.user,
            password : payload.password,
            referencia : payload.reference,
            concepto : payload.concept,
            monto: payload.amount },
      }).on('complete', function(data, response) {
      console.log(response);
  });
};

exports.challenge =  function(req, res){
  console.log('execute POST MTS challenge ');
  rest.post(url_base + '/challenge', {
    data: { response: payload.response,
            session_set: payload.session_set },
      }).on('complete', function(data, response) {
      console.log(response);
  })
};

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
  rest.post(url_base + '/challenge', {
    data: { cuenta_cargo : charge_account },
      }).on('complete', function(data, response) {
      console.log(response);
  })
};
