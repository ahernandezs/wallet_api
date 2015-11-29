var mongoose = require('mongoose');
var db = mongoose.connect(   process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||   'mongodb://localhost/amdocs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	phoneID:Number 
});

module.exports = mongoose.model('BlackListUser', userSchema);