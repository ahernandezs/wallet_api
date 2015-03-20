var mongoose = require('mongoose');
var rest = require('restler');
var soap = require('soap');
var soapurl = process.env.REST_URL_BMX;


exports.login =  function(req, res){
  console.log('execute POST BMX login ');
};

exports.challenge =  function(req, res){
  console.log('execute POST MTS challenge ');
};

exports.payment =  function(req, res){
  console.log('execute POST MTS payment ');
};
