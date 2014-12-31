var async = require('async');
var transacction = require('../transacction');
var config = require('../../config.js');


exports.getTransacctions = function(phoneIDToSearch, callback) {
    console.log( 'Get Transacctions' );
    transacction.find({phoneID:phoneIDToSearch, type:'MONEY'}, 'title description amount date',{sort: {date: -1}}, function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            console.log('Empty');
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            console.log('Return Collection');
            response = { statusCode: 0, additionalInfo: transacction };
            callback(null, transacction);
        }
    });
};

exports.getTransacctionsDox = function(phoneIDToSearch, callback) {
    console.log( 'Get Transacctions DOX' );
    transacction.find({phoneID:phoneIDToSearch, type:'DOX'}, 'title description amount date',{sort: {date: -1}}, function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            callback(null, transacction);
        }
    });
};

exports.createTranssaction = function(data, callback) {
    console.log('Save transacction');
    var newTransacction = new transacction(data);
    var result = newTransacction.save(function(err) {
        if (err) return 1;
        return 0;
    });
    if (result === 1)
        callback('ERROR', 'The transacction could not be created');
    else
        callback(null, 'The Transacction was created successfully');
};

exports.getTransacctionsSocialFeed = function(callback) {
    console.log( 'Get Transacctions' );
    //compras
    //regalos 
    //transferencias
    async.waterfall([

        function(callback){
            var conditionsBuys = { 'operation':config.messages.type.BUY };
            var buys = transacction.find(conditionsBuys, 'title description amount date operation type');
            buys.sort({date: -1});
            buys.limit(10);
            buys.exec(function (err1, buyTransactions) {
                callback(null,buyTransactions);
            });
        },

        function(buyTransactions, callback){
            var conditionsTransfers = { 'operation':config.messages.type.TRANSFER }
            var transfers = transacction.find(conditionsTransfers, 'title description amount date operation type');
            transfers.sort({date: -1});
            transfers.limit(10);
            transfers.exec(function (err1, transferTransactions) {
                callback(null, buyTransactions, transferTransactions);
            });
        },
        
        function(buyTransactions, transferTransactions, callback){
            var conditionsGifts = { 'operation':config.messages.type.GIFT };
            var gifts = transacction.find(conditionsGifts, 'title description amount date operation type');
            gifts.sort({date: -1});
            gifts.limit(10);
            gifts.exec(function (err1, giftsTransactions) {
                callback(null,buyTransactions, transferTransactions,giftsTransactions);
            });
        },

        function(buyTransactions, transferTransactions,giftsTransactions, callback){
            var resulTransactions = buyTransactions.concat(transferTransactions);
            resulTransactions = resulTransactions.concat(giftsTransactions)
            resulTransactions.sort(compare);
            response = { statusCode: 0, additionalInfo: resulTransactions }
            callback(null, response);
        }

        ], function (err, result){
            callback(null,result);
        });
};


function compare(a,b) {
    var keyA = new Date(a.date),
    keyB = new Date(b.date);
    // Compare the 2 dates
    if(keyA > keyB) return -1;
    if(keyA < keyB) return 1;
    return 0;
};
