var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var loanSchema =  new Schema({
    merchantID: Number,
    customerImage: String,
	customerName: String,
	amount : String,
	status:String,
	date: String,
    phoneID: String
});

module.exports = mongoose.model('Loan', loanSchema);
