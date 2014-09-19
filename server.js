var express = require('express')
var url = require("url");
var user =  require('./routes/users');
var wallet = require('./routes/wallet');
var product = require('./routes/products');
var merchant = require('./routes/merchants')
var urbanService = require('./services/urban');
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

app.get('/api/ping', function(req, res){
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
app.post('/api/register', user.register);
app.post('/api/updateprofile', user.updateProfile);
app.post('/api/resetpin', user.resetPin);
app.post('/api/buy', wallet.buy);
app.post('/api/balance', wallet.balance);
app.post('/api/transfer', wallet.transfer);
app.post('/api/sell', wallet.sell);
app.get('/api/products',product.products);
app.get('/api/merchants',merchant.merchants);
app.post('/api/push',urbanService.singlePush);
app.post('/api/getorderhistory',merchant.getOrderHistory);
app.put('/api/order', merchant.putOrder);
app.post('/api/order', merchant.updateOrder)
app.post('/api/orders', merchant.getOrders);

app.listen( process.env.PORT  || 3000);
console.log('Listening on port 3000');
