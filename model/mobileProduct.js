var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	productID : Number,
    merchantId: Number,
	name: String,
    url: String,
	description: String,
	cost: Number,
	typeMoney : String,
	status: String,
	schedule: String,
	customerCode: Number,
	demonstratorCode: Number
});

module.exports = mongoose.model('mobile_product', productSchema);
