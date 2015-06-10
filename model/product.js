var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	productID : Number,
    merchantId: Number,
	name: String,
    url: String,
	description: String,
	cost: Number,
	status: String,
	schedule: String,
	CustomerCode: Number,
	DemonstratorCode: Number
});

module.exports = mongoose.model('Product', productSchema);
