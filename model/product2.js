var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var discountSchema = new Schema({
    merchantId: Number,
	name: String,
    url: String,
	description: String,
	cost: Number,
	discount: Number,
	status: String
});

module.exports = mongoose.model('Discount', discountSchema);
