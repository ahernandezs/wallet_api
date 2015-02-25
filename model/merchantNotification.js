var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var merchantNotificationSchema =  new Schema({
	id:Number,
	appID: String ,
	OS: String ,
	environment : String,
	group: String,
});

module.exports = mongoose.model('MerchantsNotification', merchantNotificationSchema);  
