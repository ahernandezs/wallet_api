var express = require('express')
var url = require("url");
var user =  require('./routes/users');
var wallet = require('./routes/wallet');
var product = require('./routes/products');
var merchant = require('./routes/merchants')
var loan = require('./routes/loans');
var urbanService = require('./services/urban-service');
var fs = require('fs');
var app = express();
app.use(express.json());
app.use(express.urlencoded())
app.use(express.static(__dirname + '/app'));

// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
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
	if(req.originalUrl.toString() === '/api/register')
		console.log('Interceptor in login');
	next();
};

app.get('/api/ping', function(req, res){
	console.log(req.body)
	var body = 'pong';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', Buffer.byteLength(body));
	res.end(body);
	console.log('execute GET method ping');
});

app.get('/api/createsession',user.createsession);
app.post('/api/validate',user.validate);
app.post('/api/authorize',user.authorize);
app.post('/api/login',user.login);
app.post('/api/login2',user.login2);
app.post('/api/register', interceptorHeader ,user.register);
app.post('/api/updateprofile', user.updateProfile);
app.post('/api/uploadimage', user.uploadImage);
app.post('/api/resetpin', user.resetPin);
//app.post('/api/buy', wallet.buy);
app.post('/api/balance', wallet.balance);
app.post('/api/transfer', wallet.transfer);
app.post('/api/sell', wallet.sell);
app.post('/api/products', product.products);
app.get('/api/merchants',merchant.merchants);
app.post('/api/push',urbanService.singlePush);
app.post('/api/getorderhistory',merchant.getOrderHistory);
app.put('/api/order', merchant.putOrder);
app.post('/api/order', merchant.updateOrder)
app.post('/api/orders', merchant.getOrders);
app.post('/api/loans', loan.getLoans);
app.post('/api/getdoxs', user.getDoxs);
app.post('/api/putdoxs', user.putDoxs);
app.post('/api/loan', loan.updateLoan);
app.post('/api/inventory', product.inventory);
app.post('/api/updateinventory', product.updateInventory);
app.post('/api/buyflow', wallet.buyFlow);

app.listen( process.env.PORT  || 3000);
console.log('Listening on port 3000');
