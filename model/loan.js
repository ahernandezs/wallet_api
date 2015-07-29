var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var loanSchema =  new Schema({
    merchantID: Number,
    customerImage: String,
	customerName: String,
	amount : String,
	status:String,
	date: String,
	months : Number,
	interest : Number,
    phoneID: String ,
    months: Number,
    interest : String ,
    interest : String ,
    pay : Number
});

module.exports = mongoose.model('Loan', loanSchema);
