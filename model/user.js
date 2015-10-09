var mongoose = require('mongoose');
var db = mongoose.connect(   process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||   'mongodb://localhost/amdocs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String ,
	company: String ,
	email:String ,
	pin:String ,
	phoneID:Number ,
	appID:String,
	phoneID:String ,
	appID:String ,
	doxs:Number ,
	OS : String,
    lastSession : String,
    environment :String ,
    profileCompleted : Number,
    group : String,
    twitter: String,
    facebook: String,
    answer:String,
    canPurchase:String,
    sms:Number,
	validated: Boolean,
	countryCode: String
});

module.exports = mongoose.model('User', userSchema);
