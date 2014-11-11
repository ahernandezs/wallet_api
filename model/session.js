var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sessionSchema = new Schema({
	token: String,
	pin: String,
	phoneID: String,
	group: String
});

module.exports = mongoose.model('Session', sessionSchema);
