/**
 * Created by nemux on 9/10/15.
 */
var async = require('async');
var soap = require('soap');
var config = require('../../config');
var balance = require('./balance-flow');
var moment = require('moment-timezone');
var billTransaction = require('../../model/billTransaction');
var Userquery = require('../../model/queries/user-query');
var urbanService = require('../../services/notification-service');
var doxsService = require('../../services/doxs-service');
var ReceiptQuery = require('../../model/queries/receipt-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var messageQuery = require('../../model/queries/message-query');
var soapurl = process.env.SOAP_URL;
var logger = config.logger;



exports.pay_bill = function(payload, callback){

    var transid;
    var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);

    logger.info('PAYLOAD TO PAYBILL-FLOW BODY ->' + JSON.stringify(payload));

    verify_bill_rules(payload,function(verified, message){

        if (verified){
            async.waterfall([

                function(callback) {
                    var requestSoap = { sessionid: payload.sessionid, to: config.username, amount : payload.bill.total , type: config.wallet.type.MONEY };
                    var request = { transferRequest: requestSoap };

                    logger.info('1.- DO TRANSFER FROM USER WALLET');

                    soap.createClient(soapurl, function(err, client) {
                        client.transfer(request, function(err, result) {
                            if (err) {
                                logger.error(err);
                                return new Error(err);
                            } else {
                                var response = result.transferReturn;
                                transid = response.transid;
                                if (response.result != 0) {
                                    console.log('Result '+ response.result);
                                    var responseTransfer = {};
                                    if(response.result === 7 ){
                                        logger.error('Error de transferencia');
                                        responseTransfer = { statusCode: 1, additionalInfo: "Transaction not allowed" };
                                    }
                                    else{
                                        responseTransfer = { statusCode: 1, additionalInfo: JSON.stringify(result) };
                                    }
                                    callback('ERROR', responseTransfer);
                                } else {
                                    logger.info('---TRANSFER MADE');
                                    callback(null, payload.sessionid);
                                }
                            }
                        });
                    });
                },

                function(sessionid, callback){
                    var message = {};
                    message.status = config.messages.status.NOTREAD;
                    message.type = config.messages.type.BILLPAYMENT;
                    message.title = payload.message;
                    message.phoneID = payload.phoneID;
                    message.date = dateTime;
                    message.message = payload.message;
                    //message.additionalInfo = {};

                    logger.info('2.- SAVE MESSAGE IN DB');

                    messageQuery.createMessage(payload.phoneID, message, function(err, result) {
                        if (err) {
                            var response = { statusCode: 1, additionalInfo: result };
                            callback('ERROR', response);
                        } else {
                            var extraData = { action: config.messages.action.BILLPAYMENT , additionalInfo : {transactionid: transid}, _id:result._id };
                            payload.extra = { extra:extraData };
                            callback(null, sessionid,payload);
                        }
                    });
                },

                function(sessionid,message, callback) {
                    logger.info('3.- SEND PUSH NOTIFICATION');
                    urbanService.singlePush(message, function(err, result) {
                        var response = { statusCode: 0, additionalInfo: 'The payment was successful' };
                        callback(null,sessionid);
                    });
                },

                function(sessionid,callback){
                    console.log('RECEIVER FROM DOXS-> ' + payload.phoneID);
                    console.log('DOXS EARNED-> ' + config.doxs.pay_a_bill);
                    var payloadoxs = {phoneID: payload.phoneID, action: 'pay_a_bill', type: config.wallet.type.DOX}
                    doxsService.saveDoxs(payloadoxs, function(err, result){
                        if(err) {
                            console.log('ERROR'+ response);
                            callback('ERROR IN DOX EARNED', {statusCode:1,additionalInfo : "Error in DOX Service"});
                        } else {
                            console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
                            callback(null, sessionid);
                        }
                    });
                },

                function(sessionid,callback){
                    var updateDoxs = {phoneID: payload.phoneID, sessionid: sessionid};
                    console.log('Saving doxs in mongo');
                    Userquery.putDoxs(updateDoxs, function(err,result){
                        if (err)
                            callback('Error', { statusCode:1, additionalInfo: { error: err, result: result}});
                        else
                            callback(null,sessionid);
                    });
                },

                function(sessionid,callback){
                    logger.info('4.- GET BALANCE');
                    balance.balanceFlow(sessionid, function(err, balance) {
                        if(err){
                            var response = { statusCode: 1, additionalInfo: balance };
                            callback('ERROR', response);
                        }
                        logger.info('---BALANCE ACQUIRED');
                        callback(null,balance);
                    });
                },

                function(balance, callback) {
                    logger.info('5.- CREATE RECEIPT FROM BILLPAYMENT' );
                    var receipt = {};
                    receipt.emitter = payload.phoneID;
                    receipt.receiver = payload.bill.issuer;
                    receipt.amount = payload.bill.total;
                    receipt.message = payload.message;
                    receipt.additionalInfo = payload.additionalInfo;
                    receipt.title = payload.message;
                    receipt.date = dateTime;
                    receipt.type = config.receipt.type.BILLPAYMENT;
                    receipt.status = 'DELIVERED';
                    receipt.owner = 0;
                    ReceiptQuery.createReceipt(receipt, function(err, result) {
                        if (err)
                            callback('ERROR', err);
                        else {
                            logger.info('---RECEIPT CREATED');
                            callback(null, balance, receipt);
                        }
                    });
                },

                function(balance,receipt, callback) {
                    logger.info('6.- CREATE HISTORY TRANSACTION FROM BILLPAYMENT' );
                    var transacction = {};
                    transacction.title = 'Bill Payment';
                    transacction.type = config.transaction.type.BILLPAYMENT ,
                    transacction.date = dateTime;
                    transacction.amount = (-1) * receipt.amount;
                    transacction.additionalInfo = receipt.additionalInfo;
                    transacction.operation = config.transaction.operation.BILLPAYMENT;
                    transacction.phoneID = receipt.emitter;
                    Userquery.findAppID(receipt.emitter,function(err,result){
                        transacction.description ='To ' + result.name;
                        transacctionQuery.createTranssaction(transacction, function(err, result) {
                            if (err)
                                callback('ERROR', err);
                            else{
                                logger.info('---TRANSACTION CREATED');
                                balance.date = dateTime;
                                balance.additionalInfo.transId = result.id;
                                balance.additionalInfo.doxEarned = config.doxs.pay_a_bill;
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
                    logger.info('7.- BILLPAYMENT FLOW FINISHED');
                    callback(null,result);
                }
            });
        } else {
            callback(true,{statusCode:1, additionalInfo: message});
        }
    });
};

function verify_bill_rules(payload, callback) {
    billTransaction.findOne({phoneID:payload.phoneID, billId:payload.bill.billId}, function(err,transaction){

        var transDoc = {
            phoneID: payload.phoneID,
            billId:payload.bill.billId,
            dateTime: moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19),
        };

        if (err)
            handleError();
        if (!transaction){
            logger.info('NO TRANSACTIONS! CREATING THE TRANSACTION');
            var billTrans = new billTransaction(transDoc);

            logger.info('--------OBJECT FOR TRANSACTION-----------------');
            console.log(billTrans);
            logger.info('-------------------------');

            billTrans.save(function(err){
                if (!err) {
                    logger.info('RULES SUCCESS!!');
                    callback(true,'RULES SUCCESS!!');
                    return;
                }
                else {
                    logger.error('ERROR IN MONGODB!!!');
                    console.log(err);
                    callback(false,'ERROR IN MONGODB!!!');
                    return;
                }
            });
        } else {
            logger.error('BILL ALREADY PAYED!');
            callback(false,'BILL ALREADY PAYED!');
            return;
        }
    });
}