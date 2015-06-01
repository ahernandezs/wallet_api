var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
	eventTitle: String ,
	date: String ,
	color: String,
	place:String ,
	imageBanner:String,
    prices: String,
    desc:String,
    address:String,
    placeImage:String
});

module.exports = mongoose.model('Event', eventSchema);
