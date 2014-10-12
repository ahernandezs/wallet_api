var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var transacctionSchema =  new Schema({
	title:String,
	date : String,
	type: String,
	amount: String,
	description : String,
	additionalInfo : String,
	operation:String ,
	phoneID:String,
});

module.exports = mongoose.model('Transacction', transacctionSchema);
