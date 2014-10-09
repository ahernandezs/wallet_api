var Merchant = require('../merchant');
var config = require('../../config.js');

exports.getMerchanByID = function(merchantID, callback) {
    console.log( 'Get Merchan By ID: ' + merchantID);
    Merchant.find({ 'id': merchantID }, 'appID OS', function(err, merchant)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.merchants.errMsg };
            callback("ERROR: " + err.message, response);
            console.log(err.message);
        } else if (merchant.length === 0) {
            response = { statusCode: 0, additionalInfo: config.merchants.emptyMsg }
            callback(null, response);
            console.log(config.loans.emptyMsg);
        } else {
            console.log('return merchant');
            console.log(merchant);
            callback(null, merchant[0]);
        }
    });
};