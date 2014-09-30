var mongoose = require('mongoose');
var User = require('../model/user');
var Userquery = require('../model/queries/user-query');
var anzenUser = require('./flows/register-flow');
var sessionUser = require('./flows/login-flow');
var awsS3 = require('../services/aws-service');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.login =  function(req, res){
  console.log('execute POST method login');
  console.log(req.body);
  sessionUser.loginFlow(req.body,function(err,result){
      if(result.statusCode === 0){
        res.setHeader('X-AUTH-TOKEN', result.sessionid);
        delete result.sessionid;
      }
      res.json(result);
  });
};

exports.createsession = function(req, res) {
  console.log('execute GET method createsession');
  soap.createClient(soapurl, function(err, client) {
    client.createsession({}, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);
        var response = result.createsessionReturn;
        res.json(response);
      }
    });
  });
};

exports.logout = function(req, res){
  var logoutResponse = {
  };
  var responseString = JSON.stringify(user);
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': userString.length
  };
  res.send(responseString);
};

exports.register = function(req, res){
  console.log('execute POST method register');
  console.log(req.body);
  anzenUser.registerFlow(req.body, function(err,result){
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
    }
    res.json(result);
  });
};

exports.updateProfile = function(req, res){
  console.log('execute POST method updateProfile');
  console.log(req.body);
  Userquery.updateUser(req.body, function(err,result){
    res.json(result);
  });
};

exports.authorize = function(req, res){
  console.log('execute POST method authorize');
  console.log(req.body);
  var request = {authoriseRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.authorise(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);
        var response = result.authoriseReturn;
        res.json(response);
      }
    });
  });
};

exports.orders = function(req, res) {
  console.log('execute GET method orders');
};

exports.orderDetail = function(req, res) {
  console.log('execute GET method orders')
};

exports.resetPin = function(req, res){
  console.log('execute POST method resetPin');
  console.log(req.body);
  var request = { resetPinRequestType : req.body } ;
  //var request = {resetPinRequest: requestType };
  console.log(request);
  soap.createClient(soapurl, function(err, client) {
    client.resetPin(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);
        var response = result.resetPinReturn;
        res.json(response);
      }
    });
  });
};

exports.validate = function(req, res){
  console.log('execute POST method validate');
  console.log(req.body);
  Userquery.validateUser(req.body.phoneID, function(err,result){
    res.json(result);
  });
};

exports.putDoxs = function(req, res){
  Userquery.putDoxs(req.body, function(err,result){
    res.json(result);
  });
};

exports.getDoxs = function(req, res){
  Userquery.getDoxs(req.body.phoneID, function(err,result){
    res.json(result);
  });
};
exports.uploadImage = function(req,res){
  console.log('execute POST method uploadImage');
  console.log(req.headers['image-profile']);
  awsS3.uploadImage2S3(req,function(err,result){
    res.json(result);
  });
};
