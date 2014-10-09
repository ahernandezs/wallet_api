var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sessionSchema = new Schema({
	token: String,
	pin: String,
	phoneID: String
});

module.exports = mongoose.model('Session', sessionSchema);
