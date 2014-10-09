var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema =  new Schema({
	phoneID:String,
	title: String ,
	type : String ,
	message:String ,
	status:String ,
	additionalInfo:String
});

module.exports = mongoose.model('Message', messageSchema);  
