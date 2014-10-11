var express = require('express')
var url = require("url");
var user =  require('./routes/users');
var wallet = require('./routes/wallet');
var product = require('./routes/products');
var merchant = require('./routes/merchants')
var message = require('./routes/messages');
var transacction = require('./routes/transacctions');
var loan = require('./routes/loans');
var urbanService = require('./services/urban-service');
var fs = require('fs');
var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/app'));

// ## CORS middleware
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	}
	else {
		next();
	}
};
app.use(allowCrossDomain);
app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

var interceptorHeader = function(req, res, next) {
	console.log('Running interceptor');
	console.log(req.originalUrl.toString());
	console.log(req.headers['x-auth-token']);
    user.regenerate(req, res, function(err, result) {
        if (err)
            res.json(result);
        else {
            req.headers['x-auth-token'] = result;
            next();
        }
    });
};

app.get('/api/ping', function(req, res){
	console.log(req.body)
	var body = 'pong';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', Buffer.byteLength(body));
	res.end(body);
	console.log('execute GET method ping');
});

app.post('/api/validate',user.validate);
app.post('/api/register', user.register);
app.post('/api/login', user.login);
app.post('/api/updateprofile', user.updateProfile);
app.post('/api/uploadimage', interceptorHeader, user.uploadImage);
app.post('/api/balance', interceptorHeader, wallet.balance);
app.get('/api/balance', interceptorHeader, wallet.getBalance);
app.post('/api/products', interceptorHeader, product.products);
app.post('/api/loans', loan.getLoans);
app.post('/api/loan', loan.createLoan);
app.post('/api/buyflow', wallet.buyFlow);
app.get('/api/users', user.getUsers);
app.post('/api/transferFunds', wallet.transferFunds);
app.post('/api/gift', wallet.sendGift);
app.post('/api/senddoxs', wallet.senddoxs);
app.get('/api/messages',message.getMessages);
app.put('/api/message',message.updateMessage);
app.get('/api/transacctions',transacction.getTransacctionsHistory);
app.get('/api/transacctionsDox',transacction.getTransacctionsDox);
//Merchant operations
app.put('/api/order', merchant.putOrder);
app.post('/api/order', merchant.updateOrder);
app.post('/api/orders', merchant.getOrders);
app.get('/api/merchants',merchant.merchants);
app.post('/api/getorderhistory',merchant.getOrderHistory);
app.post('/api/inventory', product.inventory);
app.post('/api/updateinventory', product.updateInventory);
app.get('/api/prizes', product.getPrizes);
app.put('/api/loan', loan.updateLoan);
app.get('/api/leaderboard',user.getLeaderboard);

app.listen( process.env.PORT  || 3000);
console.log('Listening on port 3000');
