var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var merchantSchema =  new Schema({
	_id: Number ,
	user: String ,
	statusLoan:Number,
	Date: String
});

module.exports = mongoose.model('Loan', merchantSchema);  
