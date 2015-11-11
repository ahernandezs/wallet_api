var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var doxInfoSchema =  new Schema({
	description : String,
    urlImage : String,
    id: Number,
    amount : Number
}); 

module.exports = mongoose.model('DoxInfo', doxInfoSchema);
