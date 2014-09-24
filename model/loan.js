var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var loanSchema =  new Schema({
    merchantId: Number,
    customerImage: String,
	customerName: String,
	status:String,
	date: String,
    phoneID: String
});

module.exports = mongoose.model('Loan', loanSchema);
