var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/amdocs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String , 
	email:String , 
	pin:String , 
	phoneID:String , 
	appID:String   
});

module.exports = mongoose.model('users', userSchema);    
