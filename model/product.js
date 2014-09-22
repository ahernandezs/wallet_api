var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
    merchantId: Number,
	name: String,
	description: String,
	cost: Number,
	status: String
});

module.exports = mongoose.model('Product', productSchema);

