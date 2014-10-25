var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receiptSchema = new Schema({
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
    orderID:Number
});

module.exports = mongoose.model('Receipt', receiptSchema);
