/**
 * Created by nemux on 19/10/15.
 */

var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var venueSchema = Schema({type: String, cost: Number});

var eventSchema = new Schema({
    eventId: String,
    eventTitle: String,
    eventDate: Date,
    color: String,
    place: String,
    imageBanner: String,
    prices: [venueSchema],
    description:String,
    discount:Number,
    address: String,
    placeImage:String
});

eventSchema.statics.getAllEvents = function(callback){
    return this.find({},callback);
};

eventSchema.statics.getEvent = function(eventId, callback){
    return this.findOne({'eventId':eventId},{ '_id': false},callback);
};

module.exports = mongoose.model('event', eventSchema);

