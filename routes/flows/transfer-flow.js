var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var messageQuery = require('../../model/queries/message-query');
var sessionQuery = require('../../model/queries/session-query');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var urbanService = require('../../services/urban-service');
var balance = require('./balance-flow');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var doxsService = require('../../services/doxs-service');

  exports.transferFlow = function(payload,callback) {
      async.waterfall([
        function(callback){
        console.log('Validate connection');
        var response = null;
        soap.createClient(soapurl, function(err, client) {
          if(err) {
            console.log(err);
            var response = { statusCode:1 ,  additionalInfo : err };
            callback(err,response);
          }else
          callback(null);
        });
      },
        function(callback){
            console.log('Create Session');
            var response = null;
            soap.createClient(soapurl, function(err, client) {
                client.createsession({}, function(err, result) {
                    if(err) {
                        return new Error(err);
                    } else {
                        var response = result.createsessionReturn;
                        callback(null, response.sessionid); 
                    }
                });
            });
        },
        function(sessionid, callback){
            console.log('Create hashpin');
            var hashpin = config.username.toLowerCase() + config.pin;
            hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
            hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
            console.log(hashpin);
            callback(null, sessionid, hashpin);
        },
        function(sessionid, hashpin, callback){
            console.log('Login');
            var request = { sessionid: sessionid, initiator: config.username, pin: hashpin };
            var request = {loginRequest: request};
            soap.createClient(soapurl, function(err, client) {
                client.login(request, function(err, result) {
                    if(err) {
                        console.log('Error' + err);
                        return new Error(err);
                    } else {
                        var response = result.loginReturn;
                        callback(null,sessionid);
                    }
                });
            });
        },
        function(sessionid, callback){
            console.log('Transfer ' + sessionid);
            console.log(payload);
            var requestSoap = { sessionid:sessionid, to: payload.transferRequest.phoneID, amount : payload.transferRequest.amount , type: payload.transferRequest.type };
            var request = { transferRequest: requestSoap };
            console.log(request);
            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if(err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        var response = result.transferReturn;
                        if(response.result != 0){
                            var response = { statusCode:1 ,  additionalInfo : result };
                            callback("ERROR", response);
                        } else{
                            var response = { statusCode:0 ,  additionalInfo : result };
                            callback(null, response);
                        }
                    }
                });
            });
        },
    ], function (err, result) {
        if(err){      
            callback(err,result);    
        }else{
            callback(null,result);    
        }
    });
};

exports.transferFunds = function(data, callback) {
    var transid;
    var forReceipt = {};
    var dateTime;

    async.waterfall([
        function(callback) {
            console.log('Do transfer in wallet');
            console.log(data.body);
            var payload = data.body;
            var header = data.header;
            var requestSoap = { sessionid: header.sessionid, to: payload.destiny, amount: payload.amount, type: 1 };
            var request = { transferRequest: requestSoap };
            forReceipt.payload = payload;
            console.log(request);
            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if (err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        var response = result.transferReturn;
                        forReceipt.transferReturn = result;
                        transid = response.transid;
                        if (response.result != 0) {
                            var response = { statusCode: 1, additionalInfo: result };
                            callback('ERROR', response);
                        } else {
                            payload.phoneID = payload.destiny;
                            delete payload.destiny;
                            callback(null, header.sessionid,payload);
                        }
                    }
                });
            });
        },

        function(sessionid,payload,callback){
            console.log('Get sender in db ' +sessionid);
            sessionQuery.getCredentials(sessionid,function(err,user){
                console.log(user);
                forReceipt.user = user;
                var payloadoxs = {phoneID: user.data.phoneID, action: 'gift', type: 3}
                doxsService.saveDoxs(payloadoxs, function(err, result){
                    if(err) {
                        console.log('ERROR'+ response);
                    } else {
                        console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
                        Userquery.findAppID(user.data.phoneID,function(err,result){
                            if (err) {
                                var response = { statusCode: 1, additionalInfo: result };
                                callback('ERROR', response);
                            } else {
                                dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                payload.additionalInfo = JSON.stringify({transferID : transid , message : payload.message, sender: result.name ,senderImg:  config.S3.url + user.data.phoneID +'.png' , date:dateTime });
                                payload.date = dateTime;
                                console.log(payload.extra);
                                callback(null, sessionid,payload);
                            }                    
                        });
                    }
                });
            });
        },
        
        function(sessionid,payload,callback){
            console.log('Save message in DB');
            var title = config.messages.transferMsg + payload.amount;
            var extraData = { action :1, transferID: transid , additionalInfo: payload.additionalInfo };
            payload.extra = {extra : extraData} ;
            payload.status = config.messages.status.NOTREAD;
            payload.type = config.messages.type.TRANSFER;
            payload.title = title;
            messageQuery.createMessage(payload, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    callback(null, sessionid,payload);
                }
            });
        },
        function(sessionid,message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The transfer was successful' };
                callback(null, sessionid);
            });
        },
        function(sessionid, callback){
            console.log('Get Balance');
            console.log(sessionid);
            balance.balanceFlow(sessionid, function(err, result) {
                if(err){
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                }
                else
                    console.log('Obteniendo Balance');
                    callback(null,result);
            });
        },
        function(balance, callback) {
            console.log( 'Create Receipt Transfer' );
            data = forReceipt;
            var receipt = {};
            receipt.emitter = data.user.data.phoneID;
            receipt.receiver = data.payload.phoneID;
            receipt.amount = data.payload.amount;
            receipt.message = data.payload.message;
            receipt.additionalInfo = data.payload.additionalInfo;
            receipt.title = "You have send a transfer of € "+ receipt.amount;
            receipt.date = dateTime;
            receipt.type = 'TRANSFER';
            receipt.status = 'DELIVERED';
            console.log(data.payload);
            ReceiptQuery.createReceipt(receipt, function(err, result) {
                if (err)
                    callback('ERROR', err);
                else
                    callback(null, balance,receipt);
            });
        },
        function(balance,receipt, callback) {
            console.log( 'Create History transacction' );
            var transacction = {};
            transacction.title = 'Transfer Fund ';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1) * receipt.amount;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.emitter;
            console.log('receiver' + receipt.receiver);
            Userquery.findAppID(receipt.receiver,function(err,result){
                transacction.description ='To ' + result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        callback(null, balance,receipt);
                    }
                });
            });
        },
        function(balance,receipt, callback) {
            console.log( 'Create  transacction gift' );
            var transacction = {};
            transacction.title = 'Transfer Fund ';
            transacction.type = 'DOX',
            transacction.date = dateTime;
            transacction.amount = config.doxs.p2p;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.emitter;
            Userquery.findAppID(receipt.receiver,function(err,result){
                transacction.description ='To ' + result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        callback(null, balance);
                    }
                });
            });
        },
    ], function(err, result) {
        if (err) 
            callback(err, result);
        else
            callback(null, result);
    });
};
