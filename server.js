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

app.post('/api/forgotpin',user.forgotPIN);
app.post('/api/validate',user.validate);
app.post('/api/register', user.register);
app.post('/api/products', product.products);
app.post('/api/registerMerchant',merchant.register);
app.post('/api/login', user.login);
app.post('/api/updateprofile', user.updateProfile);
app.post('/api/uploadimage', interceptorHeader, user.uploadImage);
app.post('/api/balance', interceptorHeader, wallet.balance);
app.get('/api/balance', interceptorHeader, wallet.getBalance);
app.post('/api/loan', interceptorHeader, loan.createLoan);
app.post('/api/buyflow', interceptorHeader, wallet.buyFlow);
app.get('/api/users', interceptorHeader, user.getUsers);
app.post('/api/transferFunds', interceptorHeader, wallet.transferFunds);
app.post('/api/gift', interceptorHeader, wallet.sendGift);
app.post('/api/activity', interceptorHeader, wallet.activity);
app.get('/api/messages', interceptorHeader, message.getMessages);
app.put('/api/message', interceptorHeader,  message.updateMessage);
app.get('/api/transacctions', interceptorHeader, transacction.getTransacctionsHistory);
app.get('/api/transacctionsDox', interceptorHeader, transacction.getTransacctionsDox);
app.get('/api/receipts', interceptorHeader, wallet.getReceipts);
app.put('/api/receipt', wallet.updateReceipt);
app.get('/api/doxInfo', interceptorHeader, wallet.doxInfo);
//Merchant operations
//app.put('/api/order', merchant.putOrder);
app.put('/api/order', merchant.updateOrder);
app.post('/api/loans', loan.getLoans);
app.post('/api/orders', merchant.getOrders);
app.get('/api/merchants',merchant.merchants);
app.post('/api/getorderhistory',merchant.getOrderHistory);
app.post('/api/inventory', product.inventory);
app.post('/api/updateinventory', product.updateInventory);
app.get('/api/prizes', product.getPrizes);
app.put('/api/loan', loan.updateLoan);
app.get('/api/leaderboard',user.getLeaderboard);
app.post('/api/receipt', wallet.getReceipts);
app.put('/api/receiptStatus', product.changeReceiptStatus)

app.listen( process.env.PORT  || 3000);
console.log('Listening on port 3000');
