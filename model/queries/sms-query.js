/**
 * Created by nemux on 5/10/15.
 */
var sms_verification = require('../sms_verification');

exports.verify_code = function (phoneNumber, code, callback){
    sms_verification.findOneAndRemove({'phoneNumber': phoneNumber, 'verificationCode': code}, function(err, doc, result){

        if (err)
            callback(true, null);
        if (doc)
            callback(null, true);
        else
            callback(null, false);
    });
};