/**
 * Created by nemux on 6/01/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var liveUserSchema = new Schema({
    phoneID: String,
    email: String,
    name: String,
    company: String,
    balance: Number,
    doxs: Number,
    lastVisit : { type: Date, default: Date.now }
});

module.exports = mongoose.model('liveUser', liveUserSchema);