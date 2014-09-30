/*
{
	"phoneId": "Number",
	"doxs": "Number",
	"order":{
		 "userId": "Number",
		 "products": [
		  {
		   "name": "String",
		   "quantity": "Number",
		   "cost": "Number"
		  }
		 ],
		 "total": "Number",
		 "date": "String",
		 "status": "String"
	}
}
*/

var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/urban-service');
var transferFlow = require('./transfer-flow');

var soapurl = process.env.SOAP_URL;

var username = 'anzen_01';
var pin  = '1234';

exports.buyFlow = function(payload,callback) {

	var transferDoxs = {phoneID:payload.phoneID,amount:payload.doxs,type:3};
	var order = payload.order;
	var buy = {sessionid:'', target:'airtime', type:1, amount:payload.order.total};
	var balance = {sessionid:'',type:1};
    var notification = {message:'There is a new order!', phoneID: payload.phoneID}
	var id;
	var response;

	async.waterfall([

	    function(callback){
	      console.log('Create Session');
	      var response = null;
	      soap.createClient(soapurl, function(err, client) {
	        client.createsession({}, function(err, result) {
	          if(err) {
	            return new Error(err);
	          } else {
	            console.log(result);
	            var resp = result.createsessionReturn;
	            id = resp.sessionid;
	            callback(null, resp.sessionid); 
	          }
	        });
	      });
	    },
	    function(sessionid, callback){
	      console.log('Create hashpin');
	      var hashpin = username.toLowerCase() + pin ;
	      hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
	      hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
	      console.log(hashpin);
	      callback(null, sessionid, hashpin);
	    },
	    function(sessionid, hashpin, callback){
	      console.log('Login');
	      var request = { sessionid: sessionid, initiator: username, pin: hashpin };
	      var request = {loginRequest: request};
	      console.log(request);
	      soap.createClient(soapurl, function(err, client) {
	        client.login(request, function(err, result) {
	          if(err) {
	            console.log('Error' + err);
	            return new Error(err);
	          } else {
	            var resp = result.loginReturn;
	            console.log(resp);
	            callback(null);
	          }
	        });
	      });
	    },

		function(callback){
			buy.sessionid = id;
			console.log('Buying '+JSON.stringify(buy));
			soap.createClient(soapurl, function(err, client) {
				client.buy({buyRequest: buy}, function(err, result) {
					if(err) {
						console.log('Error '+err);
						return new Error(err);
					} else {
						console.log('Success '+JSON.stringify(result)+'\n\n');
						callback(null); 
					}
				});
			});
		},

		function(callback){
			balance.sessionid = id;
			console.log('Getting balance '+JSON.stringify(balance));			
			soap.createClient(soapurl, function(err, client) {
				client.balance({balanceRequest: balance}, function(err, result) {
					if(err) {
						console.log('Error '+err);
						return new Error(err);
					} else {
						console.log('Success '+JSON.stringify(result)+'\n\n');
						response = result;
						callback(null); 
					}
				});				
			});

		},

		function(callback){
			console.log('Transfering doxs '+JSON.stringify(transferDoxs));
			transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
				console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
				callback(null);
			});
		},

		function(callback){
			console.log('Saving order '+JSON.stringify(order));
			Orderquery.putOrder(order, function(err,result){
				console.log('Order saving result: '+JSON.stringify(result)+'\n\n');
				callback(null);
			});
		},

		function(callback) {
			console.log('Pushing the order');
            urbanService.singlePush(notification, function(err, result) {
                console.log('Pushing result: '+JSON.stringify(result));
                callback(null);
            });
        }

    ], function (err, result) {
      console.log("Result: "+result);
      if(err){      
        callback("Error! "+err,result);    
      }else{
        callback(null,result);    
      }  
    });
}

