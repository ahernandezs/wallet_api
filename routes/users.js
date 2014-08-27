var mongoose = require('mongoose');
var User = require('../model/user');
var soap = require('soap');
var soapurl = 'http://152.186.37.50:8280/services/umarketsc?wsdl';

exports.login =  function(req, res){
  console.log('execute POST method login');
  console.log(req.body);
  var request = {loginRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);

        var response = result.loginReturn;
        res.json(response);
      }
    });
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

function registerUserMongo(user){
  console.log("Saving User in MongoDB");
  console.log(user);

  var propSessionID = "sessionid";
  delete user[propSessionID];
  var propInitiator = "initiator";
  delete user[propInitiator];

  user.pin = user.new_pin ;
  user.email = user.email_address;

  console.log(user);
  var userToPersist = new User(user);
  console.log('User to persist user' + userToPersist);
  userToPersist.save(function (err) {
    if (err) 
    console.log('Error to persist user');
  });
};

exports.register = function(req, res){
  console.log('execute POST method register');
  console.log(req.body);
  var userMongo = JSON.parse(JSON.stringify(req.body));
  var requestSoap = req.body;
  var propPhoneID = "phoneID";
  var propAppID = "appID";
  delete requestSoap[propPhoneID];
  delete requestSoap[propAppID];
  console.log(requestSoap);
  var request = {registerRequest: requestSoap};
  console.log(request);

  soap.createClient(soapurl, function(err, client) {
    client.register(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        //register User in MongoDB
        registerUserMongo(userMongo);
        console.log(result);
        var response = result.registerReturn;
        res.json(response);
      }
    });
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
        //register User in MongoDB
        //registerUserMongo()
        console.log(result);
        var response = result.authoriseReturn;
        res.json(response);
      }
    });
  });
};

exports.orders = function(req, res) {
  console.log('execute GET method orders');
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


exports.orderDetail = function(req, res) {
  console.log('execute GET method orders');
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
