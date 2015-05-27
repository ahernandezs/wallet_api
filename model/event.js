var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
	eventTitle: String ,
	date: String ,
	place:String ,
	imageBanner:String,
    prices: { regular: String,
			    VIP : String 
			}
});

module.exports = mongoose.model('Event', eventSchema);
