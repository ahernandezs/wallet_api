var mongoose = require('mongoose');
var User = require('../model/user');
var soap = require('soap');
var soapurl = 'http://152.186.37.50:8280/services/umarketsc?wsdl';


exports.sell =  function(req, res){
  console.log('execute POST method sell');
  console.log(req.body);
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
  console.log(req.body);
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
  console.log('execute POST method buy');
  console.log(req.body);
  var request = {buyRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.buy(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);

        var response = result.buyReturn;
        res.json(response);
      }
    });
  });
};

exports.balance = function(req, res) {
  console.log('execute POST method balance');
  console.log(req.body);
  var request = {balanceRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.balance(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);
        var response = result.balanceReturn;
        res.json(response);
      }
    });
  });
};
