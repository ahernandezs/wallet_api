var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Orderquery = require('../../model/queries/order-query');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/urban-service');
var transferFlow = require('./transfer-flow');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');

exports.sendGift = function(payload,callback) {

	var order = payload.order;
  	order['userId'] = payload.beneficiaryId;
	var id;
	var response;
	var name;

	async.waterfall([

	    function(callback){
	      Userquery.getName(payload.phoneID, function(err, resp) {
			name = resp;
			callback(null);
	      });
	    },

		function(callback){
			var requestSoap = { sessionid:payload.sessionid, to: config.username, amount : payload.order.total , type: 1 };
			var request = { transferRequest: requestSoap };
			console.log(request);
			soap.createClient(soapurl, function(err, client) {
				client.transfer(request, function(err, result) {
					if(err) {
						console.log('Error '+err);
						return new Error(err);
					} else {
						callback(null,payload.sessionid);
					}
				});
			});
		},


		function(sessionid, callback){
			console.log('balance e-wallet');
			var  request = { sessionid: sessionid, type: 1  };
			var request = {balanceRequest: request};
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						console.log(response);
						if(response.result  === '0' )
							var response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
						else
							var response = { statusCode:1 ,  additionalInfo : response };

						callback(null,sessionid,response.additionalInfo.current);
					}
				});
			});
		},

		function(sessionid,currentMoney, callback){

			var requestBalance = { sessionid: sessionid, type: 3 };
			var request = { balanceRequest: requestBalance };
			console.log(request);
			soap.createClient(soapurl, function(err, client) {
				client.balance(request, function(err, result) {
					if(err) {
						return new Error(err);
					} else {
						var response = result.balanceReturn;
						if(response.result  === '0' ) {
							var balance = { current : currentMoney , dox : response.current , order : Math.floor((Math.random() * (1000 - 100) + 100 )) ,  status :'IN PROGRESS' , date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')  } ;
							response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : balance };
						}else{
							var response = { statusCode:1 ,  additionalInfo : response };
						}
						callback(null,sessionid,response);
					}
				});
			});
		},

		function(sessionid,response, callback){
			Orderquery.putOrder(order, function(err,result){
				console.log('Order saving result: '+JSON.stringify(result));
				callback(null,response);
			});
		},

		function(response,callback) {
			console.log('sending push');
            var message = 'You have received a coffee gift!';
            payload.message = message;
            var extraData = { action :2, phoneID: payload.phoneID, name: name.name, avatar: config.S3.url + payload.phoneID +'.png' };
            payload.extra = {extra : extraData} ;
            payload.phoneID = payload.beneficiaryPhoneID;
            delete payload.beneficiaryPhoneID;
            urbanService.singlePush(payload, function(err, result) {
                console.log('Pushing result: '+JSON.stringify(result));
                callback(null,response);
            });
        },

    ], function (err, result) {
      if(err){      
        callback("Error! "+err,result);    
      }else{
        callback(null,result);    
      }  
    });
}

