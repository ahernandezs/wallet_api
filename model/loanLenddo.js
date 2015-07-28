var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var loanSchema =  new Schema({
	phoneID: String,
	date: String,
	maxLoanAmount: Number,
	status: String
});

module.exports = mongoose.model('LoanLenddo', loanSchema);
