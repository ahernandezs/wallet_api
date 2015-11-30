var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	phoneID:String 
});

module.exports = mongoose.model('BlockUser', userSchema);