var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var prizeSchema = new Schema({
    imgUrl: String,
	description: String
});

module.exports = mongoose.model('Prize', prizeSchema);
