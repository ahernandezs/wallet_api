var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var merchantSchema =  new Schema({
	name: String ,
	address:String,
	latitude:Number ,
	longitude:Number ,
	appID: String ,
	OS: String ,
	id:Number,
	distance: String ,
	schedule: String ,
	imgUrl: String,
	usersConnected:Number,
	environment : String,
	open: String,
	group: String,
	visible: String
});

module.exports = mongoose.model('Merchant', merchantSchema);  
