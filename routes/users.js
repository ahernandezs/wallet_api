var mongoose = require('mongoose');
var User = require('../model/user');
var Userquery = require('../model/queries/user-query');
var anzenUser = require('./flows/register-flow');
var sessionUser = require('./flows/login-flow');
var forgotPin = require('./flows/forgotPin-flow');
var awsS3 = require('../services/aws-service');
var config = require('../config.js');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.login =  function(req, res, callback){
  console.log('execute POST method login');
  console.log(req.body);
  sessionUser.loginFlow(req.body,function(err,result){
      var token = result.sessionid;
      if(result.statusCode === 0){
        res.setHeader('X-AUTH-TOKEN', result.sessionid);
        delete result.sessionid;
      }
      if (req.body.continue === undefined)
          res.json(result);
      else {
          result.token = token;
          callback(result);
      }
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
  req.body.sessionid = req.headers['x-auth-token'];
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

exports.login2 =  function(req, res){
  console.log('execute POST method login');
  console.log(req.body);
  var request = {loginRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
        if(err) {
          console.log(err);
          res.send(500);
        } else {
          console.log(result);
          var response = result.loginReturn;
          res.json(response);
        }
    });
  });
};

exports.getUsers = function(req, res){
  console.log('Execute GET method get users');
  var request = {};
  request.sessionid = req.headers['x-auth-token'];
  request.phoneID = req.headers['x-phoneid'];
  Userquery.getUsers(request,function(err,result){
    var result = {url_base: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/', users: result};
    console.log(result);
    res.json(result);
  });
};

exports.regenerate = function(req, res, callback) {
    console.log( 'POST method regenerate (session)' );
    var request = {};
    request.sessionid = req.headers['x-auth-token'];
    request.phoneID = req.headers['x-phoneid'];
    request.type = 1;
    sessionUser.regenerate(request, res, function(err, result) {
        if (err === 'ERROR') {
            console.log(result);
            callback('ERROR', result);
        } else if (err !== 'STOP')
            callback(null, result);
        else
            callback(null, result);
    });
};

exports.getLeaderboard = function(req, res){
  var phoneID = req.headers['x-phoneid'];
  Userquery.getLeaderboard(phoneID,function(err,result){
    var result = {url_base: config.S3.url, users: result}
    res.json(result);
  });
}

exports.forgotPIN = function(req, res){
    console.log('Request forgotten PIN');
    var phoneID = req.headers['x-phoneid'];
    forgotPin.requestPinFlow(phoneID,function(err,result){
        console.log(result);
        if(err)
            res.json({ statusCode : 1, message : result});
        else
            res.json({statusCode : 0, message :  result});
    });
};

exports.inviteFriend = function(req, res){
  req.body.sessionid = req.headers['x-auth-token'];
  req.body.phoneID = req.headers['x-phoneid'];

  Userquery.inviteFriend(req.body, function(err, result){
    if(err) {
        console.log('Error: '+err);
    } else {
        console.log('Resultado: '+result);
        res.json(result);
    }
  });
}
