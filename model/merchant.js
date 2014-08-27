var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var merchantSchema =  new Schema({
	_id: Number ,
	name: String ,
	address:String,
	latitude:Number ,
	longitude:Number ,	
});

module.exports = mongoose.model('Merchant', merchantSchema);  



