var Merchant = require('../merchant');
var config = require('../../config.js');

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
        if (err) callback("ERROR", { statusCode: 1,  message: 'Update Fail' });
        callback(null, { statusCode: 0 ,  additionalInfo: result });
    });
};
