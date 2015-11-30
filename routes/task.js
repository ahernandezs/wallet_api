/**
 * Created by nemux on 19/11/15.
 */

var soap = require('soap');
var async = require('async');
var crypto = require('crypto');
var user = require('../model/user');
var billTransactionModel = require('../model/billTransaction');
var loanModel = require('../model/loan');
var messageModel = require('../model/message');
var mobileProductTransactionModel = require ('../model/mobileProductTransaction');
var receiptModel = require('../model/receipt');
var requestMoneyModel = require('../model/requestMoney');
var sessionModel = require('../model/session');
var shopOrderModel = require('../model/shopOrder');
var smsVerificationModel = require ('../model/sms_verification');
var transactionModel = require('../model/transacction');
var transfer = require('./flows/transfer-flow');
var merchantQuery = require('../model/queries/merchant-query');
var config = require('../config.js');
var soapurl = process.env.SOAP_URL;
var logger = config.logger;

exports.dox_reset = function dox_reset_all(req, res){
    var phoneId = req.params.phoneId;
    var query = (phoneId === 'all')
                ? {}
                : {phoneID: phoneId.toString() };

    console.log(query);
    console.log('PhoneId to Reset Dox ->' + query);

    merchantQuery.getMerchantByID(1, function(err,result){
        if (err) {
            console.log('ERROR IN GET MERCHANT');
            callback('ERROR', {message: 'Fail  getLeaderboard'});
        } else {
            user.find(query, 'phoneID name doxs pin', {sort: {doxs: -1}},function (err, people) {
                console.log('------------------------------------');
                if (err) {
                    console.log('ERRROOOOOOOOOOOOOOOOOOOOOOORRRR');
                    return res.send({statusCode: 1, additionalInfo: 'Error Finding User'});
                }
                else if(people){
                    console.log('*****************TOTAL PEOPLE*****************-> ' + people.length);
                    var total = 1;
                    var resetUsers = [];

                    for(var i = 0; i < people.length; i++){
                        //For all users we do a transfer.
                        userInfo = {};
                        userInfo.amount = people[i].doxs;
                        userInfo.phoneID = people[i].phoneID;
                        userInfo.pin = people[i].pin;
                        console.log(userInfo);
                        transfer.resetDox(userInfo,function(err,infoDox){
                            if(err) {
                                console.log('-------FINISH SERVICE---------');
                                res.send(infoDox);
                                return;
                            }

                            console.log('TOTAL RESETEADOS -> ' + total );
                            console.log('PhoneId-> ' + userInfo.phoneID + ' DOX -> ' + infoDox);
                            resetUsers.push(userInfo.phoneID);

                            if (total == people.length){
                                console.log('-------FINISH SERVICE---------');
                                res.send({statusCode:0, additionalInfo:{total: total, users:[resetUsers]}});
                                return;
                            }
                            total++;
                        });
                    }
                } else {
                    console.log("User(s) not found");
                    res.send({statusCode:1, additionalInfo:"USER(S) NOT FOUND"});
                }
            });
        }
    });
};

exports.register_delete = function(req, res){
    var phoneId = req.params.phoneId;
    var confirm = req.body.confirm;
    var hardreset =  req.body.hard_reset;

    console.log(req.body);

    if (confirm === 'YES'){
        logger.info('Eliminando usuario...');

        user.findOneAndRemove({phoneID: phoneId}, function (err, user, result) {
            if (err) {
                res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                return;
            }
            if (user) {
                console.log('Result -> ' + result);
                console.log('Eliminando usuario ->' + user);
                if (hardreset === 'YES') {
                    hard_reset(user, function (err, resp) {
                        console.log('-----RESULT HARD RESET----');
                        console.log(resp);
                        if (err) {
                            console.log('-----ERROR----');
                            console.log(err);
                            res.send({statusCode: 1, deleted: 'NO', additionalInfo: {userInfo: user}});
                        } else
                            res.send({statusCode: 0, deleted: 'YES', additionalInfo: {userInfo: user}});
                    });
                }
                else
                    res.send({statusCode: 0, deleted: 'YES', additionalInfo: { userInfo: user}});
            } else {
                res.send({statusCode: 0, additionalInfo: {message: 'User not found.'}});
            }
        });
    } else {
        res.send({statusCode: 1, additionalInfo: {message: 'Confirmation needed!.'}});
    }
};

exports.add_money = function(req, res){
    var phoneId = req.params.phoneId;
    var amount = req.body.amount;

    async.waterfall([
        function(callback) {
            var response = null;

            logger.info('1.- VALIDATE CONNECTION.');
            soap.createClient(soapurl, function (err, client) {
                if (err) {
                    logger.error('1.- VALIDATE CONNECTION.');
                    console.log(err);
                    var response = {
                        statusCode: 1,
                        additionalInfo: err
                    };
                    callback(err, response);
                } else
                    callback(null);
            });
        },
        function(callback) {
            logger.info('2.- CREATE SESSION');
            var response = null;
            soap.createClient(soapurl, function (err, client) {
                client.createsession({}, function (err, result) {
                    if (err) {
                        logger.error('2.- CREATE SESSION');
                        console.log(err);
                        var response = {statusCode: 1, additionalInfo: err};
                        callback(err, response);
                    } else {
                        logger.info(result);
                        var response = result.createsessionReturn;
                        callback(null, response.sessionid);
                    }
                });
            });
        },
        function(sessionid, callback) {
            logger.info('3.- CREATE HASHPIN');
            var hashpin = config.username.toLowerCase() + config.pin;
            hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
            hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
            logger.info(hashpin);
            callback(null, sessionid, hashpin);
        },
        function(sessionid, hashpin, callback) {
            logger.info('4.- LOGIN');
            var request = {
                loginRequest: {
                    sessionid: sessionid,
                    initiator: config.username,
                    pin: hashpin
                }
            };
            console.log('-----------------LOGIN REQUEST---------------');
            console.log(request);
            soap.createClient(soapurl, function (err, client) {
                client.login(request, function (err, result) {
                    if (err) {
                        logger.error('4.- LOGIN');
                        logger.error(err);
                        var response = {
                            statusCode: 1,
                            additionalInfo: err
                        };
                        callback(err, response);
                    } else {
                        var response = result.loginReturn;
                        logger.info(response);
                        callback(null, sessionid);
                    }
                });
            });
        },

        function(sessionid,callback) {

            logger.info('5.- MAKE TRANSFER');
            var requestSoap = {
                sessionid: sessionid,
                to: phoneId,
                amount: amount,
                type: config.wallet.type.MONEY
            };

            var request = {
                transferRequest: requestSoap
            };

            logger.info(request);
            soap.createClient(soapurl, function (err, client) {
                client.transfer(request, function (err, result) {
                    if (err) {
                        logger.error('5.- MAKE TRANSFER');
                        console.log(err);
                        var response = {
                            statusCode: 1,
                            additionalInfo: err
                        };
                        callback(err, response);
                    } else {
                        var response = result.transferReturn;
                        var error = null;
                        if (response.result != 0) {
                            logger.error(result)
                            var response = {
                                statusCode: 1,
                                additionalInfo: result
                            };
                            error = 'ERROR';
                        } else
                            logger.info(result);
                        callback(error, response);
                    }
                });
            });
        }
    ], function (err, result) {
        var response = {};
        if(err){
            logger.error('GENERAL ERROR  --->' + JSON.stringify(result));
            response.statusCode = 1;
            response.additoinalInfo = result;
        } else {
            response.statusCode = 0;
            response.additionalInfo = {
                message: 'Added ' + config.currency.symbol + amount + ' to ' + phoneId
            };
        }
        res.send(response);
    });
};

function hard_reset(user, callback){

    async.waterfall([
            function (callback){
                billTransactionModel.remove({phoneID: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('BILL TRANSACTIONS DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                loanModel.remove({phoneID: user.phoneID}, function (err) {
                    if (err)
                        callback(true, {statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('LOANS DELETED!');
                        callback(null, user);
                    }
                })
            },

            function(user, callback){
                messageModel.remove({phoneID: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('MESSAGES DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                mobileProductTransactionModel.remove({phoneID: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('MOBILE PRODUCTS TRANSACITIONS DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                receiptModel.remove({emmiter: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('RECEIPTS DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                requestMoneyModel.remove({sender: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('REQUEST MONEY DELETED!');
                        callback(null, user);
                    }
                });
            },

            function (user, callback) {
                sessionModel.remove({phoneID: user.phoneID},function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('SESSION DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                shopOrderModel.remove({customerID: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('SHOP ORDER DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                smsVerificationModel.remove({phoneNumber: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('SMS VERIFICATION DELETED!');
                        callback(null, user);
                    }
                });
            },

            function(user, callback){
                transactionModel.remove({phoneID: user.phoneID}, function(err){
                    if (err)
                        callback(true,{statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else {
                        console.log('TRANSACTIONS DELETED!');
                        callback(null, user);
                    }
                });
            }
/*
            function(user, callback) {
                var response = null;

                logger.info('1.- VALIDATE CONNECTION.');
                soap.createClient(soapurl, function (err, client) {
                    if (err) {
                        logger.error('1.- VALIDATE CONNECTION.');
                        console.log(err);
                        var response = {
                            statusCode: 1,
                            additionalInfo: err
                        };
                        callback(err, response);
                    } else
                        callback(null, user);
                });
            },
            function(user, callback) {
                logger.info('2.- CREATE SESSION');
                var response = null;
                soap.createClient(soapurl, function (err, client) {
                    client.createsession({}, function (err, result) {
                        if (err) {
                            logger.error('2.- CREATE SESSION');
                            console.log(err);
                            var response = {statusCode: 1, additionalInfo: err};
                            callback(err, response);
                        } else {
                            logger.info(result);
                            var response = result.createsessionReturn;
                            callback(null, user, response.sessionid);
                        }
                    });
                });
            },
            function(user, sessionid, callback) {
                logger.info('3.- CREATE HASHPIN');
                var hashpin = config.username.toLowerCase() + config.pin;
                hashpin = sessionid + crypto.createHash('sha1').update(hashpin).digest('hex').toLowerCase();
                hashpin = crypto.createHash('sha1').update(hashpin).digest('hex').toUpperCase();
                logger.info(hashpin);
                callback(null, user, sessionid, hashpin);
            },
            function(user, sessionid, hashpin, callback) {
                logger.info('4.- LOGIN');
                var request = {
                    loginRequest: {
                        sessionid: sessionid,
                        initiator: config.username,
                        pin: hashpin
                    }
                };
                console.log('-----------------LOGIN REQUEST---------------');
                console.log(request);
                soap.createClient(soapurl, function (err, client) {
                    client.login(request, function (err, result) {
                        if (err) {
                            logger.error('4.- LOGIN');
                            logger.error(err);
                            var response = {
                                statusCode: 1,
                                additionalInfo: err
                            };
                            callback(err, response);
                        } else {
                            var response = result.loginReturn;
                            logger.info(response);
                            callback(null,user, sessionid);
                        }
                    });
                });
            },

            function(user, sessionid, callback){
                logger.info('5.- DELETE FROM UMARKET');
                var request = {
                    sessionid: sessionid,
                    agent: user.phoneID
                };
                console.log(request);
                soap.createClient(soapurl, function(err,client){
                    client.delete(request, function(err,result){
                        var response = {};
                        var error = null;
                        if(err){
                            logger.error('5.- DELETE FROM UMARKET');
                            logger.error(err);
                            response.statusCode  = 1;
                            response.additionalInfo = err;
                            err = true;
                        } else {
                            response.statusCode = 0;
                            response.result = result;
                            console.log('-----RESULT DELETE USER UMARKET-----');
                            console.log(result);
                        }
                        callback(error,response);
                    });
                });
            }
        */
        ],
        function(err, result){
            if (err) {
                console.log('HUBO UN ERROR!!!!!');
                callback(true,result);
            } else
                callback(null,result);
        });
}