var Merchant = require('../merchant');
var sessionQuery = require('./session-query');
var config = require('../../config.js');
var async = require('async');


exports.getMerchanByID = function(merchantID, callback) {
    console.log( 'Get Merchan By ID: ' + merchantID);
    Merchant.find({ 'id': merchantID }, 'appID OS', function(err, merchant)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.merchants.errMsg };
            callback("ERROR: " + err.message, response);
        } else if (merchant.length === 0) {
            response = { statusCode: 0, additionalInfo: config.merchants.emptyMsg }
            callback(null, response);
        } else {
            console.log('return merchant');
            callback(null, merchant[0]);
        }
    });
};

exports.updateMerchanByID = function(payload, callback) {
    console.log( 'Update Merchan with ID: ' + payload.id);
    var conditions ={ id : payload.id};
    var payload = payload;
    Merchant.update(conditions, payload, null, function(err, result) {
        if (err) callback("ERROR", { statusCode: 1,  message: 'register failed' });
        callback(null, { statusCode: 0 ,  additionalInfo: 'register succesful' });
    });
};

exports.getMerchands = function(callback){
    async.waterfall([
      function(callback){
        sessionQuery.getSessions(function(err, users){
          callback(null, users);
        });
      },
      function(users, callback){
        Merchant.find(function(err,data){
          data[0].usersConnected = users;
          callback(null, data);
        });
      },
      function(data, callback){
        dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        console.log(dateTime);
        data[0].open = 1;

        callback(null, data);
      }
    ], function (err, result){
        callback(null,result);
    });

};
