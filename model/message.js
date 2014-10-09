var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema =  new Schema({
	title: String ,
	type : String ,
	extra:String ,
	status:String 
});

module.exports = mongoose.model('Message', messageSchema);  
