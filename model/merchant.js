var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var merchantSchema =  new Schema({
	_id: Number ,
	name: String ,
	address:String,
	latitude:Number ,
	longitude:Number ,
	appID: String ,
	OS: String ,
	distance: String ,
	schedule: String ,
	imgUrl: String,
	usersConnected:Number,
	environment : String,
	open: String,
	group: String
});

module.exports = mongoose.model('Merchant', merchantSchema);  
