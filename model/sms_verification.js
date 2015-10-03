var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var smsVerificationSchema = new Schema({
    phoneId: String,
    phoneNumber: String,
    createdAt: Date,
    verificationCode: Number
});

module.exports = mongoose.model('SMSVerification', smsVerificationSchema);
