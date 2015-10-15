var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var smsVerificationSchema = new Schema({
    phoneId: String,
    phoneNumber: String,
    createdAt: Date,
    verificationCode: Number
});

module.exports = mongoose.model('smsverification', smsVerificationSchema);

smsVerificationSchema.statics.verify_code = function(phoneNumber, code, callback){
    //callback(err,doc,result)
    sms_verification.findOneAndRemove({'phoneNumber': phoneNumber, 'verificationCode': code}, callback);
};

smsVerificationSchema.statics.set_code = function (phoneNumber, callback){
    //callback(err,doc)
    sms_verification.findOne({ 'phoneNumber': phoneNumber }, callback);
};


