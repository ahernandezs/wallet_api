var mongoose = require('mongoose');
var User = require('./model');
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

exports.register = function(req, res){
	console.log("Executing register user operation");
	var user = req.body ;
	console.log(req.body);
	var userToPersist = new User(req.body);
	console.log('User to persist user' + userToPersist);

	userToPersist.save(function (err) {
	  if (err) 
	  console.log('Error to persist user');
	});

	res.send(200);
};