var express = require('express')
var url = require("url");
var http = require("http");
var user =  require('./routes/users');
var wallet = require('./routes/wallet');
var product = require('./routes/products');
var merchant = require('./routes/merchants')
var message = require('./routes/messages');
var airtime = require('./routes/airtime');
var ticket = require('./routes/ticket');
var topup =  require('./routes/topup');
var lendo =  require('./routes/lendo');
var transacction = require('./routes/transacctions');
var loan = require('./routes/loans');
var spa = require('./routes/spa');
var bill = require('./routes/bills');
var task = require('./routes/task');
var urbanService = require('./services/notification-service');
var userQuery = require('./model/queries/user-query');
var fs = require('fs');
var ip = require('ip').address();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/app'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// usernames which are currently connected
var usersockets = {};
io.on('connection', function (socket) {
		// when the client emits 'adduser', this listens and executes
		socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		console.log('Add user for websockets' + username);
		socket.username = username;
		usersockets[username] = socket.id;
	});
});


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
    console.log('user: ' + req.headers['x-phoneid']);
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
	res.status(400);
	res.end(body);
	console.log('execute GET method ping');
});

app.get('/api/forgotpin',user.forgotPIN);
app.post('/api/validate',user.validate);
app.post('/api/verify',user.verify);
app.post('/api/verifyCustomer',user.verify_customer);
app.post('/api/preregister', user.preregister);
app.post('/api/register', user.register);
app.post('/api/products', product.products);
app.post('/api/products2', product.products2);
app.get('/api/bill/:id',bill.get_bill);
app.get('/api/bill/:id/push',bill.get_bill_with_push);
app.post('/api/bill/pay',interceptorHeader, bill.pay_bill);
app.post('/api/airtime',interceptorHeader, airtime.buy);
app.get('/api/ticket',ticket.get_all);
app.get('/api/ticket/:id',ticket.get_by_id);
app.post('/api/ticket/pay',interceptorHeader, ticket.buy);
app.post('/api/topup',interceptorHeader, topup.buy);
app.post('/api/registerMerchant',merchant.register);
app.post('/api/login', user.login);
app.post('/api/updateprofile', user.updateProfile);
app.post('/api/uploadimage', interceptorHeader, user.uploadImage);
app.post('/api/balance', interceptorHeader, wallet.balance);
app.get('/api/balance', interceptorHeader, wallet.getBalance);
//app.post('/api/loan', interceptorHeader, loan.createLoan);
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
app.post('/api/invitefriend', interceptorHeader, user.inviteFriend);
app.post('/api/requestMoney',interceptorHeader, user.requestMoney);
app.post('/api/message',interceptorHeader, user.sendMessage);
app.post('/api/resolveRequest', interceptorHeader, user.resolveRquest);
app.get('/api/socialFeed', interceptorHeader,transacction.getSocialFeeds);
app.get('/api/sms', interceptorHeader,user.getSMSMessage);
app.post('/api/contacts',interceptorHeader,user.getContacts);
app.get('/api/pendingPayments',interceptorHeader,transacction.getPendingPayments);
app.get('/api/pendingNotifications',interceptorHeader,transacction.getPendingNotifications);
app.post('/api/pendingPayment',interceptorHeader,transacction.transferPendingPayment);
app.post('/api/authorizeMobileBuy',interceptorHeader,user.authorizeShopMobileBuy);
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
app.put('/api/receiptStatus', product.changeReceiptStatus);
app.post('/api/coupon', wallet.setCoupon);
app.get('/api/orderTemporals',product.getOrderTemporals);
app.post('/api/buyProducts',wallet.buyMobileProducts);
// SPA operations
app.get('/api/spa/users', spa.getUsers);
app.get('/api/spa/transactions/:phoneID/:type', spa.getTransactions);
app.get('/api/spa/receipts/:phoneID', spa.getReceipts);
app.get('/api/spa/loans/:phoneID', spa.getLoans);

//services for OFFLA integration
app.post('/api/offla/validateanswer', user.validateAnswer);
app.post('/api/offla/validatebuy', user.validateBuy);
app.post('/api/offla/authorizebuy', user.authorizeBuy);

//services for LENDDO
app.post('/api/lenddo/webhook', lendo.notification);
app.get('/api/lenddo/pendingLoans', lendo.getPendingLoans);

//services for merchant
app.get('/api/merchant/usersVerified', merchant.usersVerified);
app.get('/api/merchant/mobileProducts', merchant.getMobileProducts);
app.post('/api/merchant/notifyBuyProducts',merchant.buyMobileProducts);
app.get('/api/merchant/users',user.getUsers);

//services for cash-credit
app.post('/api/loanDecision', interceptorHeader, loan.getDecision);
app.post('/api/loanConfirm',interceptorHeader, loan.loanConfirm);

//Task
app.delete('/api/dox/:phoneId',task.dox_reset);


server.listen(process.env.PORT  || 3000);
console.log('Listening on port 3000, server time set to '+new Date());

