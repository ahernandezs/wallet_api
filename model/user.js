var mongoose = require('mongoose');
var db = mongoose.connect(   process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||   'mongodb://localhost/amdocs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	_id: Number ,
	name: String ,
	email:String ,
	pin:String ,
	phoneID:String ,
	appID:String
});

module.exports = mongoose.model('User', userSchema);


