var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ReceiptSchema = new Schema({
	order: Number ,
	date: String,
	product : String ,
	total: String ,
	dox: String;
});

module.exports = mongoose.model('Receipt', sessionSchema);
