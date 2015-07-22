var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var doxInfoSchema =  new Schema({
	description : String,
    urlImage : String
}); 

module.exports = mongoose.model('DoxInfo', doxInfoSchema);
