var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receiptSchema = new Schema({
	emitter: String,
    receiver: String,
    amount: String,
    date: String,
    dox: Number,
    message: String,
    type: String,
    status: String,
    facebook: Number,
    twitter: Number,
    instagram: Number
});

module.exports = mongoose.model('Receipt', receiptSchema);
