var express = require('express')
, url = require("url")
 // , url = require("url")
 // , swagger = require("swagger-node-express");

var app = express();
app.use(express.json());
app.use(express.urlencoded())

// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,X-BANK-TOKEN');
	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	}
	else {
		next();
	}
};

app.use(allowCrossDomain);

var soap = require('soap');
var soapurl = 'http://152.186.37.50:8280/services/umarketsc?wsdl';

app.get('api/ping', function(req, res){
	var body = 'pong';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', Buffer.byteLength(body));
	res.end(body);
	console.log('execute GET method ping');
});

app.get('/api/createsession', function(req, res) {
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
});

app.post('/api/login', function(req, res){
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

});

app.get('/api/accounts/:type', function(req, res){
	var typeAccount = req.params.type ;

	if(typeAccount > 0 && typeAccount < 4){
		console.log('execute GET method accounts ' + typeAccount);
		console.log(typeAccount);
		fs = require('fs')
		fs.readFile('./jsonResponse/accounts'+ typeAccount +'.json', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			res.end(data);
		});
	}else{
		res.end(404);
	}
});


// function readFile(filename){
// 	fs = require('fs')
// 	fs.readFile('./jsonResponse/accounts'+ typeAccount +'.json', 'utf8', function (err,data) {
// 		if (err) {
// 			return console.log(err);
// 		}
// 		res.end(data);
// 	});
// }

app.listen(3000);
console.log('Listening on port 3000');
