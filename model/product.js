var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	_id: Number ,
	name: String ,
	description:String ,
	cost: Number 
});

module.exports = mongoose.model('Product', productSchema);

