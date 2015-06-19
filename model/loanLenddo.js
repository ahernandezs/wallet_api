var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var loanSchema =  new Schema({
	phoneID: String,
	date: String,
	status: String
});

module.exports = mongoose.model('LoanLenddo', loanSchema);
