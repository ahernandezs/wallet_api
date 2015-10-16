var async = require('async');
var soap = require('soap');
var config = require('../../config');
var urbanService = require('../../services/notification-service');
var messageQuery = require('../../model/queries/message-query');
var balance = require('./balance-flow');
var ReceiptQuery = require('../../model/queries/receipt-query');
var Userquery = require('../../model/queries/user-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var ReceiptQuery = require('../../model/queries/receipt-query');
var soapurl = process.env.SOAP_URL;
var logger = config.logger;


exports.buy = function(payload, callback){

    var transid;
    var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);

    console.log(payload);

    async.waterfall([

        function(callback) {
            console.log('Do transfer in wallet');
            var requestSoap = { sessionid: payload.sessionid, to: config.username, amount : payload.amount , type: 1 };
            var request = { transferRequest: requestSoap };

            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if (err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        var response = result.transferReturn;

                        transid = response.transid;
                        if (response.result != 0) {
                            console.log('Result '+ response.result);
                            var responseTransfer = {};
                            if(response.result === 7 ){
                                console.log('Error de transferencia');
                                responseTransfer = { statusCode: 1, additionalInfo: "Transaction not allowed" };
                            }
                            else{
                                responseTransfer = { statusCode: 1, additionalInfo: JSON.stringify(result) };
                            }
                            callback('ERROR', responseTransfer);
                        } else {
                            callback(null, payload.sessionid);
                        }
                    }
                });
            });
        },

        function(sessionid, callback){
            console.log('Save message in DB');
            var message = {};

            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.AIRTIMEBUY;
            message.title = payload.message;
            message.phoneID = payload.phoneID;
            message.date = dateTime;
            message.message = payload.message;
            message.additionalInfo = {};
            messageQuery.createMessage(payload.phoneID, message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.message = title;
                    var extraData = { action: config.messages.action.AIRTIME, additionalInfo : {transactionid: transid}, _id:result._id };
                    payload.extra = { extra:extraData };
                    callback(null, sessionid, payload);
                }
            });
        },

        function(sessionid,message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The AirTime Buy was successful' };
                callback(null,sessionid);
            });
        },

        function(sessionid,callback){
            console.log('Get Balance');
            balance.balanceFlow(sessionid, function(err, balance) {
                if(err){
                    var response = { statusCode: 1, additionalInfo: balance };
                    callback('ERROR', response);
                }
                else
                    console.log('Obteniendo Balance');
                //result.additionalInfo.doxAdded = config.doxs.p2p;
                callback(null,balance);
            });
        },

        function(balance, callback) {
            console.log( 'Create Receipt Transfer' );
            var receipt = {};
            receipt.emitter = payload.phoneID;
            receipt.receiver = payload.to;
            receipt.amount = payload.amount;
            receipt.message = payload.message;
            receipt.additionalInfo = payload.additionalInfo;
            receipt.title = 'You had bought airtime of '+  config.currency.symbol + ' ' + receipt.amount + ' to ' + receipt.receiver;
            receipt.date = dateTime;
            receipt.type = config.receipt.type.AIRTIMEBUY;
            receipt.status = 'DELIVERED';
            receipt.owner = 0;
            ReceiptQuery.createReceipt(receipt, function(err, result) {
                if (err)
                    callback('ERROR', err);
                else
                    callback(null, balance,receipt);
            });
        },

        function(balance,receipt, callback) {
            console.log( 'Create History transaction for emitter' );
            var transacction = {};
            transacction.title = 'AirTime Buy';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1) * receipt.amount;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.emitter;
            Userquery.findAppID(receipt.emitter,function(err,result){
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

    ], function (err, result) {
        if(err){
            console.log('Error  --->' + JSON.stringify(result));
            callback(err,result);
        }else{
            callback(null,result);
        }
    });
};