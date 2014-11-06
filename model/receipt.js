var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receiptSchema = new Schema({
    _id: String,
	emitter: String,
    receiver: String,
    amount: String,
    date: String,
    dox: Number,
    title: String ,
    message: String,
    type: String,
    status: String,
    facebook: Number,
    twitter: Number,
    instagram: Number,
    additionalInfo: String,
    orderID:Number,
    owner : Number,
    loanID: String
});

module.exports = mongoose.model('Receipt', receiptSchema);
