/**
 * Created by nemux on 21/10/15.
 */

var async = require('async');
var soap = require('soap');
var config = require('../../config');
var moment = require('moment-timezone');
var crypto = require('crypto');
var messageQuery = require('../../model/queries/message-query');
var balance = require('./balance-flow');
var ReceiptQuery = require('../../model/queries/receipt-query');
var userQuery = require('../../model/queries/user-query');
var urbanService = require('../../services/notification-service');
var transacctionQuery = require('../../model/queries/transacction-query');
var soapurl = process.env.SOAP_URL;

exports.buy = function (payload, callback){

    var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
    var transid;
    console.log(payload);

    async.waterfall([
        function(callback) {
            console.log('Validate connection');

            var response = null;

            //payload.phoneID = payload.phoneID +'ES';
            console.log('Validate phoneID ---->' + payload.phoneID);
            soap.createClient(soapurl, function (err, client) {
                if (err) {
                    console.log(err);
                    var response = {statusCode: 1, additionalInfo: err};
                    callback(err, response);
                } else
                    callback(null);
            });
        },
        function(callback) {
            console.log('Create Session');
            var response = null;
            soap.createClient(soapurl, function (err, client) {
                client.createsession({}, function (err, result) {
                    if (err) {
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.createsessionReturn;
                        callback(null, response.sessionid);
                    }
                });
            });
        },
        function(sessionid, callback) {
            console.log('Create hashpin');
            var hashpin = config.username.toLowerCase() + config.pin;
            hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
            hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
            console.log(hashpin);
            callback(null, sessionid, hashpin);
        },
        function(sessionid, hashpin, callback) {
            console.log('Login');
            var request = {sessionid: sessionid, initiator: config.username, pin: hashpin};
            var request = {loginRequest: request};
            soap.createClient(soapurl, function (err, client) {
                client.login(request, function (err, result) {
                    if (err) {
                        console.log('Error' + err);
                        return new Error(err);
                    } else {
                        var response = result.loginReturn;
                        console.log(response);
                        callback(null, sessionid);
                    }
                });
            });
        },

        function(sessionid, callback){
            if (payload.dox) {
                console.log('Make DOX Transfer ' + payload.sessionid);
                var requestSoap = {
                    sessionid: payload.sessionid,
                    to: config.username,
                    amount: payload.dox,
                    type: config.wallet.type.DOX
                };
                var request = {transferRequest: requestSoap};
                console.log(request);
                soap.createClient(soapurl, function (err, client) {
                    client.transfer(request, function (err, result) {
                        if (err) {
                            console.log(err);
                            return new Error(err);
                        } else {
                            console.log(result);
                            var response = result.transferReturn;
                            if (response.result != 0) {
                                var response = {statusCode: 1, additionalInfo: result};
                                callback("ERROR", response);
                            } else {
                                callback(null, sessionid);
                            }
                        }
                    });
                });
            } else {
                callback(null, sessionid);
            }
        },

        function(sessionid,callback) {

            console.log('Make Transfer ' + sessionid);
            var requestSoap = {sessionid: sessionid, to: payload.phoneID, amount: payload.amount, type: config.wallet.type.MONEY};
            var request = {transferRequest: requestSoap};
            console.log(request);
            soap.createClient(soapurl, function (err, client) {
                client.transfer(request, function (err, result) {
                    if (err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.transferReturn;
                        if (response.result != 0) {
                            var response = {statusCode: 1, additionalInfo: result};
                            callback("ERROR", response);
                        } else {
                            //Call with User sessionid
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
            message.type = config.messages.type.TOPUP;
            message.title = payload.message;
            message.phoneID = payload.phoneID;
            message.date = dateTime;
            message.message = payload.message;
            //message.additionalInfo = {};
            messageQuery.createMessage(payload.phoneID, message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    var extraData = { action: config.messages.action.TICKET, additionalInfo : {transactionid: transid}, _id:result._id };
                    payload.extra = { extra:extraData };
                    callback(null, sessionid, payload);
                }
            });
        },

        function(sessionid,message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The Top-up was successful' };
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
                callback(null,balance);
            });
        },

        function(balance, callback) {
            console.log( 'Create Receipt Transfer' );
            var receipt = {};
            receipt.emitter = payload.phoneID;
            receipt.receiver = payload.phoneID;
            receipt.amount = payload.amount;
            receipt.message = payload.message;
            receipt.additionalInfo = payload.additionalInfo;
            receipt.title = 'You top up your wallet';
            receipt.date = dateTime;
            receipt.type = config.receipt.type.TOPUP;
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
            transacction.title = 'Top-up';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1) * receipt.amount;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.emitter;
            userQuery.findAppID(receipt.emitter,function(err,result){
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

exports.verify_customer = function(payload, callback){
    var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
    var transid;
    console.log(payload);

    async.waterfall([
        function(callback) {
            console.log('Validate connection');
            var response = null;

            //payload.phoneID = payload.phoneID +'ES';
            console.log('Validate phoneID ---->' + payload.phoneID);
            soap.createClient(soapurl, function (err, client) {
                if (err) {
                    console.log(err);
                    var response = {statusCode: 1, additionalInfo: err};
                    callback(err, response);
                } else
                    callback(null);
            });
        },
        function(callback) {
            console.log('Create Session');
            var response = null;
            soap.createClient(soapurl, function (err, client) {
                client.createsession({}, function (err, result) {
                    if (err) {
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.createsessionReturn;
                        callback(null, response.sessionid);
                    }
                });
            });
        },
        function(sessionid, callback) {
            console.log('Create hashpin');
            var hashpin = config.username.toLowerCase() + config.pin;
            hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
            hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
            console.log(hashpin);
            callback(null, sessionid, hashpin);
        },
        function(sessionid, hashpin, callback) {
            console.log('Login');
            var request = {sessionid: sessionid, initiator: config.username, pin: hashpin};
            var request = {loginRequest: request};
            soap.createClient(soapurl, function (err, client) {
                client.login(request, function (err, result) {
                    if (err) {
                        console.log('Error' + err);
                        return new Error(err);
                    } else {
                        var response = result.loginReturn;
                        console.log(response);
                        callback(null, sessionid);
                    }
                });
            });
        },
        function(sessionid,callback) {

            console.log('Make Transfer ' + sessionid);
            var requestSoap = {sessionid: sessionid, to: payload.phoneID, amount: payload.amount, type: config.wallet.type.MONEY};
            var request = {transferRequest: requestSoap};
            console.log(request);
            soap.createClient(soapurl, function (err, client) {
                client.transfer(request, function (err, result) {
                    if (err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        console.log(result);
                        var response = result.transferReturn;
                        if (response.result != 0) {
                            var response = {statusCode: 1, additionalInfo: result};
                            callback("ERROR", response);
                        } else {
                            callback(null);
                        }
                    }
                });
            });
        },

        function(callback){
            console.log('Save message in DB');
            var message = {};

            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.VERIFYCUSTOMER;
            message.title = payload.message;
            message.phoneID = payload.phoneID;
            message.date = dateTime;
            message.message = payload.message;
            //message.additionalInfo = {};
            messageQuery.createMessage(payload.phoneID, message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    var extraData = { action: config.messages.action.VERIFYCUSTOMER, additionalInfo : {transactionid: transid}, _id:result._id };
                    payload.extra = { extra:extraData };
                    callback(null);
                }
            });
        },
        function(callback){
            urbanService.singlePush(payload, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR',response)
                    return;
                }
                callback(null,result);
            });

        }

    ], function (err, result) {
        if(err){
            console.log('Error  --->' + JSON.stringify(result));
            callback(err,result);
        }else{
            callback(null,result);
        }
    });
};