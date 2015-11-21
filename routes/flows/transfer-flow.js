var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var moment = require('moment-timezone');
var Userquery = require('../../model/queries/user-query');
var messageQuery = require('../../model/queries/message-query');
var sessionQuery = require('../../model/queries/session-query');
var soapurl = process.env.SOAP_URL;
var config = require('../../config.js');
var urbanService = require('../../services/notification-service');
var balance = require('./balance-flow');
var sessionUser = require('./login-flow');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var pendingTranfer = require('../../model/pendingTransfer');
var doxsService = require('../../services/doxs-service');
var logger = config.logger;

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
            var requestSoap = { sessionid:sessionid, to: payload.transferRequest.phoneID, amount : payload.transferRequest.amount , type: payload.transferRequest.type };
            var request = { transferRequest: requestSoap };
            soap.createClient(soapurl, function(err, client) {
                client.transfer(request, function(err, result) {
                    if(err) {
                        console.log(err);
                        return new Error(err);
                    } else {
                        var response = result.transferReturn;
                        console.log("Result: "+JSON.stringify(result));
                        if(response.result != 0){
                            var response = { statusCode:1 ,  additionalInfo : result };
                            callback("ERROR", response);
                        } else{
                            var response = { statusCode:0 ,  additionalInfo : JSON.stringify(result) };
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
    var creditMoney;
    var forReceipt = {};
    var receiptName;
    var senderName;
    var additionalInfoReceiver;
    var additionalInfoReceiverJSON;
    var addInfo;
    var beneficiaryName;
    var receiptAvatar;
    var dateTime;
    var msg;
    var forReturn = {};
    var mainUser = data.header.phoneID;

    if(data.body.paymeback){
        creditMoney = data.body.paymeback;
    }

    async.waterfall([
        
        function(callback) {
            transacctionQuery.findUserTransfers(mainUser, function(err,transfers){
                if(err){
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                }
                else
                    callback(null);
            });
        },

        function(callback) {
            console.log('Do transfer in wallet');
            console.log(data);
            var payload = data.body;
            msg = payload.message;
            var header = data.header;
            var requestSoap = { sessionid: header.sessionid, to: payload.destiny, amount: payload.amount, type: 1 };
            console.log('Request for transfer');
            console.log(requestSoap);
            var request = { transferRequest: requestSoap };
            forReceipt.payload = payload;
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
                            payload.phoneID = payload.destiny;
                            delete payload.destiny;
                            callback(null, header.sessionid,payload);
                        }
                    }
                });
            });
        },

        function(sessionid,payload,callback){
            console.log('Get receiver in db ' + payload.phoneID);
            Userquery.getName(payload.phoneID,function(err,user){
                if (err) {
                    var response = { statusCode: 1, additionalInfo: err };
                    callback('ERROR', response);
                } else {
                    receipt = user.name;
                    beneficiaryName = user.name;
                    receiptAvatar = config.S3.url + payload.phoneID +'.png';
                    callback(null, sessionid,payload);
                }  

            });
        },

        function(sessionid,payload,callback){
            console.log('Get sender in db ' + mainUser);
            var requestSession = { phoneID :  mainUser };
            sessionQuery.getCredentials(requestSession,function(err,user){
                forReceipt.user = user;
                var payloadoxs = {phoneID: user.data.phoneID, action: 'transfer_money_to_a_friend', type: config.wallet.type.DOX}
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
                                dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
                                senderName = result.name;
                                addInfo = {transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime };
                                additionalInfoReceiver = JSON.stringify({transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime });
                                additionalInfoReceiverJSON = {transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime };
                                payload.additionalInfo = JSON.stringify({transferID : transid , message : payload.message,amount: payload.amount , doxEarned : config.doxs.transfer_money_to_a_friend  ,name: receipt ,avatar: receiptAvatar , date:dateTime });
                                payload.date = dateTime;
                                callback(null, sessionid,payload);
                            }                    
                        });
                    }
                });
            });
        },

        function(sessionid,payload,callback){
            var updateDoxs = {phoneID: mainUser, operation: 'transfer_money_to_a_friend', sessionid: sessionid};
            console.log('Saving doxs in mongo');
            Userquery.putDoxs(updateDoxs, function(err,result){
                callback(null,sessionid,payload);
            });
        },
        
        function(sessionid,payload,callback){
            console.log('Save message in DB');
            var message = {};
            var title = config.messages.transferMsg + senderName;
            //message = extraData;
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.TRANSFER;
            message.title = title;
            message.phoneID = payload.phoneID;
            message.date = dateTime;
            message.message = payload.message;
            message.additionalInfo = additionalInfoReceiver;
            messageQuery.createMessage(forReceipt.user.data.phoneID,message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.message = title;
                    var extraData = {   action: 1, additionalInfo : JSON.stringify(additionalInfoReceiverJSON),
                                    _id:result._id };
                    payload.extra = { extra:extraData};
                    callback(null, sessionid,payload);
                }
            });
        },

        function(sessionid,message, callback) {
            console.log('Send push notification');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The transfer was successful' };
                callback(null,sessionid,message);
            });
        },
        function(sessionid,message,callback){
            console.log('Get Balance');
            balance.balanceFlow(sessionid, function(err, result) {
                if(err){
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                }
                else
                    console.log('Obteniendo Balance');
                    //result.additionalInfo.doxAdded = config.doxs.p2p;
                    result.additionalInfo.doxEarned = config.doxs.transfer_money_to_a_friend;
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
            receipt.message = msg;
            receipt.additionalInfo = data.payload.additionalInfo;
            receipt.title = 'You have sent a Transfer of '+  config.currency.symbol + ' ' + receipt.amount + ' to ' + beneficiaryName;
            receipt.date = dateTime;
            receipt.type = 'TRANSFER';
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
            console.log( 'Create Receipt Transfer receiver' );
            data = forReceipt;
            var receipt = {};
            receipt.emitter = data.payload.phoneID;
            receipt.receiver = data.user.data.phoneID;
            receipt.amount = data.payload.amount;
            receipt.message = msg;
            addInfo.amount = receipt.amount;
            receipt.additionalInfo = JSON.stringify(addInfo);
            receipt.title = config.messages.transferMsg + senderName;
            receipt.date = dateTime;
            receipt.type = 'TRANSFER';
            receipt.status = 'DELIVERED';
            receipt.owner = 1;
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
            transacction.title = 'Transfer fund';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1) * receipt.amount;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.receiver;
            Userquery.findAppID(receipt.emitter,function(err,result){
                transacction.description ='To ' + result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        balance.additionalInfo.transId = result.id;
                        callback(null, balance,receipt);
                    }
                });
            });
        },

        function(balance,receipt, callback) {
            console.log( 'Create  transacction DOX' );
            var transacction = {};
            transacction.title = 'Transfer fund';
            transacction.type = 'DOX';
            transacction.date = dateTime;
            transacction.amount = config.doxs.transfer_money_to_a_friend;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.receiver;
            Userquery.findAppID(receipt.emitter,function(err,result){
                transacction.description ='To ' + result.name;
                forReturn.name = result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        callback(null, balance, receipt);
                    }
                });
            });
        },
        function(balance, receipt) {
            console.log( 'Create History transaction for receiver' );
            var transaction = {};
            transaction.title = 'Transfer fund';
            transaction.type = 'MONEY';
            transaction.date = dateTime;
            transaction.amount = receipt.amount;
            transaction.additionalInfo = additionalInfoReceiver;
            transaction.operation = 'TRANSFER';
            transaction.phoneID = receipt.emitter;
            transaction.creditMoney = creditMoney;
            transaction.from = mainUser;
            console.log(transaction);
            Userquery.findAppID(receipt.receiver, function(err, result) {
                transaction.description = 'From ' + result.name;
                transacctionQuery.createTranssaction(transaction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else {
                        console.log( 'Transaction created for receiver' );
                        balance.title = config.messages.transferFund + beneficiaryName;
                        balance.additionalInfo.date = dateTime;
                        balance.additionalInfo.amount = receipt.amount;
                        balance.additionalInfo.name = beneficiaryName;
                        balance.type = 'TRANSFER';
                        balance.date = dateTime;
                        balance.additionalInfo.avatar = receiptAvatar;
                        balance._id = transid;
                        callback(null, balance);
                    }
                });
            });
        }
    ], function(err, result) {
        if (err) 
            callback(err, result);
        else
            callback(null, result);
    });
};

exports.transferNotRegisteredUser = function(data, callback){
    var transid;
    var creditMoney;
    var forReceipt = {};
    var receiptName;
    var senderName;
    var additionalInfoReceiver;
    var additionalInfoReceiverJSON;
    var addInfo;
    var beneficiaryName;
    var receiptAvatar;
    var dateTime;
    var msg;
    var forReturn = {};
    var mainUser = data.header.phoneID;

    if(data.body.paymeback){
        creditMoney = data.body.paymeback;
    }

    async.waterfall([

        function(callback) {
            logger.info('1.- DO TRANSFER TO MAIN ACCOUNT');
            console.log(data);
            var payload = data.body;
            msg = payload.message;
            var header = data.header;
            var requestSoap = { sessionid: header.sessionid, to: config.username, amount: payload.amount, type: config.wallet.type.MONEY };
            console.log('1.1.- REQUEST FOR TRANSFER');
            console.log(requestSoap);
            var request = { transferRequest: requestSoap };
            forReceipt.payload = payload;
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
                            //payload.phoneID = payload.destiny;
                            //delete payload.destiny;
                            callback(null, header.sessionid,payload);
                        }
                    }
                });
            });
        },

        function(sessionid,payload,callback){
            logger.info('2.- SET RECEIVER INFO ' + payload.destiny);
            receipt = payload.destiny;
            beneficiaryName = payload.destiny;
            receiptAvatar = "" ; //config.S3.url + payload.phoneID +'.png';}
            var transfer = {};
            transfer.date =  dateTime;
            transfer.amount = payload.amount;
            transfer.sender = mainUser;
            transfer.receiver = payload.destiny;
            transfer.operation = config.transaction.operation.TRANSFER;
            transfer.message = payload.message;

            var transferNotRegistered = new pendingTranfer(transfer);

            transferNotRegistered.save(function(err,doc){
                if (err)
                    callback('ERROR',{ statusCode: 4, additionalInfo: { message:'UNAVAILABLE DATABASE SERVICE' } });
                else
                    callback(null, sessionid,payload);
            });
        },

        function(sessionid,payload,callback){
            logger.info('3.- GET SENDER IN DB ' + mainUser);
            var requestSession = { phoneID :  mainUser };
            sessionQuery.getCredentials(requestSession,function(err,user){
                forReceipt.user = user;
                var payloadoxs = {phoneID: user.data.phoneID, action: 'transfer_money_to_a_friend', type: config.wallet.type.DOX}
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
                                dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
                                senderName = result.name;
                                addInfo = {transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime };
                                additionalInfoReceiver = JSON.stringify({transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime });
                                additionalInfoReceiverJSON = {transferID : transid , message : payload.message,amount: payload.amount, name: result.name, avatar: config.S3.url + user.data.phoneID +'.png' , date:dateTime };
                                payload.additionalInfo = JSON.stringify({transferID : transid , message : payload.message,amount: payload.amount , doxEarned : config.doxs.transfer_money_to_a_friend, name: receipt ,avatar: receiptAvatar , date:dateTime });
                                payload.date = dateTime;
                                callback(null, sessionid,payload);
                            }
                        });
                    }
                });
            });
        },

        function(sessionid,payload,callback){
            var updateDoxs = {phoneID: mainUser, operation: config.doxs.transfer_money_to_a_friend ,sessionid: sessionid};
            logger.info('4.- SAVING DOX IN MONGO');
            Userquery.putDoxs(updateDoxs, function(err,result){
                callback(null,sessionid,payload);
            });
        },

        function(sessionid,payload,callback){
            logger.info('5.- SAVE MESSAGE IN MONGO');
            var message = {};
            var title = config.messages.transferMsg + senderName;
            //message = extraData;
            message.status = config.messages.status.NOTREAD;
            message.type = config.messages.type.TRANSFER;
            message.title = title;
            message.phoneID = payload.phoneID;
            message.date = dateTime;
            message.message = payload.message;
            message.additionalInfo = additionalInfoReceiver;
            messageQuery.createMessage(forReceipt.user.data.phoneID,message, function(err, result) {
                if (err) {
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                } else {
                    payload.message = title;
                    var extraData = {   action: 1, additionalInfo : JSON.stringify(additionalInfoReceiverJSON),
                        _id:result._id };
                    payload.extra = { extra:extraData};
                    callback(null, sessionid,payload);
                }
            });
        },

        function(sessionid,message, callback) {
            logger.info('6.- SEND PUSH NOTIFICATION');
            urbanService.singlePush(message, function(err, result) {
                var response = { statusCode: 0, additionalInfo: 'The transfer was successful' };
                callback(null,sessionid,message);
            });
        },
        function(sessionid,message,callback){
            logger.info('7.- GET BALANCE');
            balance.balanceFlow(sessionid, function(err, result) {
                if(err){
                    var response = { statusCode: 1, additionalInfo: result };
                    callback('ERROR', response);
                }
                logger.info('6.1.- GETTING BALANCE...');
                //result.additionalInfo.doxAdded = config.doxs.p2p;
                result.additionalInfo.doxEarned = config.doxs.transfer_money_to_a_friend;
                callback(null,result);
            });
        },
        function(balance, callback) {
            logger.info( '8.- CREATE RECEIPT TRANSFER' );
            data = forReceipt;
            var receipt = {};
            receipt.emitter = data.user.data.phoneID;
            receipt.receiver = data.payload.phoneID;
            receipt.amount = data.payload.amount;
            receipt.message = msg;
            receipt.additionalInfo = data.payload.additionalInfo;
            receipt.title = 'You have sent a Transfer of '+  config.currency.symbol + ' ' + receipt.amount + ' to ' + beneficiaryName;
            receipt.date = dateTime;
            receipt.type = 'TRANSFER';
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
            logger.info( '9.- CREATE RECEIPT TRANSFER RECEIVER' );
            data = forReceipt;
            var receipt = {};
            receipt.emitter = data.payload.phoneID;
            receipt.receiver = data.user.data.phoneID;
            receipt.amount = data.payload.amount;
            receipt.message = msg;
            addInfo.amount = receipt.amount;
            receipt.additionalInfo = JSON.stringify(addInfo);
            receipt.title = config.messages.transferMsg + senderName;
            receipt.date = dateTime;
            receipt.type = 'TRANSFER';
            receipt.status = 'DELIVERED';
            receipt.owner = 1;
            ReceiptQuery.createReceipt(receipt, function(err, result) {
                if (err)
                    callback('ERROR', err);
                else
                    callback(null, balance,receipt);
            });
        },

        function(balance,receipt, callback) {
            logger.info( '10.- CREATE HISTORY TRANSACTION FOR EMITTER' );
            var transacction = {};
            transacction.title = 'Transfer fund';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1) * receipt.amount;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.receiver;
            Userquery.findAppID(receipt.emitter,function(err,result){
                transacction.description ='To ' + result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        balance.additionalInfo.transId = result.id;
                        callback(null, balance,receipt);
                    }
                });
            });
        },

        function(balance,receipt, callback) {
            logger.info( '11.- CREATE TRANSACTION DOX' );
            var transacction = {};
            transacction.title = 'Transfer fund';
            transacction.type = config.transaction.type.DOX;
            transacction.date = dateTime;
            transacction.amount = config.doxs.transfer_money_to_a_friend;
            transacction.additionalInfo = receipt.additionalInfo;
            transacction.operation = 'TRANSFER';
            transacction.phoneID = receipt.receiver;
            Userquery.findAppID(receipt.emitter,function(err,result){
                transacction.description ='To ' + result.name;
                forReturn.name = result.name;
                transacctionQuery.createTranssaction(transacction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else{
                        console.log('Transacction Created');
                        callback(null, balance, receipt);
                    }
                });
            });
        },
        function(balance, receipt) {
            console.log( '12.- CREATE HISTORY TRANSACTION FOR RECEIVER. ' );
            var transaction = {};
            transaction.title = 'Transfer fund';
            transaction.type = 'MONEY';
            transaction.date = dateTime;
            transaction.amount = receipt.amount;
            transaction.additionalInfo = additionalInfoReceiver;
            transaction.operation = 'TRANSFER';
            transaction.phoneID = receipt.emitter;
            transaction.creditMoney = creditMoney;
            console.log(transaction);
            Userquery.findAppID(receipt.receiver, function(err, result) {
                transaction.description = 'From ' + result.name;
                transacctionQuery.createTranssaction(transaction, function(err, result) {
                    if (err)
                        callback('ERROR', err);
                    else {
                        console.log( 'Transaction created for receiver' );
                        balance.title = config.messages.transferFund + beneficiaryName;
                        balance.additionalInfo.date = dateTime;
                        balance.additionalInfo.amount = receipt.amount;
                        balance.additionalInfo.name = beneficiaryName;
                        balance.type = 'TRANSFER';
                        balance.date = dateTime;
                        balance.additionalInfo.avatar = receiptAvatar;
                        balance._id = transid;
                        callback(null, balance);
                    }
                });
            });
        }
    ], function(err, result) {
        if (err)
            callback(err, result);
        else
            callback(null, result);
    });
};

//Payload: {
// amount:""
// phoneId:""
// pin:"",
// }
exports.resetDox = function resetDox(payload, callback){
    console.log('------PAYLOAD--------');
    console.log(payload);

    async.waterfall([
        function(callback) {
            sessionUser.loginFlow(payload,function(err,sessionResult){
                var token = sessionResult.sessionid;
                if(err)
                    callback(true,{statusCode:1,additionalInfo:'Error in Login!'});
                else if(sessionResult.statusCode === 0){
                    callback(null,sessionResult);
                } else {
                    callback(true,{statusCode:1,additionalInfo:'Error while Login in StatusCode!'});
                }
            });
        },

        function(sessionInfo, callback) {

                var requestSoap = {
                    sessionid: sessionInfo.sessionid,
                    to: config.username,
                    amount: payload.amount,
                    type: config.wallet.type.DOX
                };

                var request = { transferRequest: requestSoap };
                console.log('Request for transfer');
                console.log(request);
                soap.createClient(soapurl, function(err, client) {
                    client.transfer(request, function(err, result) {
                        if (err) {
                            console.log(err);
                            return new Error(err);
                        } else {
                            var response = result.transferReturn;
                            console.log('TransactionID ->' + response.transid);
                            if (response.result != 0) {
                                console.log('Result '+ response.result);
                                var responseTransfer = {};
                                responseTransfer.statusCode = 1;
                                if(response.result === 7 )
                                    responseTransfer.additionalInfo = "Transaction not allowed";
                                else
                                    responseTransfer.additionalInfo = JSON.stringify(result);
                                console.log('Error en la transferencia.');
                                callback('ERROR', responseTransfer);
                            } else {
                                callback(null,sessionInfo, result);
                            }
                        }
                    });
                });
        },

        function(sessionInfo, result,callback){
                var updateDoxs = {phoneID: payload.phoneID, sessionid: sessionInfo.sessionid};
                logger.info('UPDATING DOX IN MONGO');
                Userquery.putDoxs(updateDoxs, function(err,newDox){
                    if (err) {
                        console.log('------ERROR UPDATING DOX IN MONGO--------');
                        console.log(err);
                        callback(true, {statusCode: 1, additionalInfo: 'Error Updating DOX in Mongo.'});
                    } else {
                        console.log('----------OK UPDATING DOX IN  MONGO-----------');
                        callback(null, newDox);
                    }
                });
            },
        ],

        function(err, result){
            if(err){
                callback(err,result);
                return;
            }else{
                console.log('--------FINISHED TRANSFER DOX--------');
                callback(null,result);
                return;
            }
    });
};
