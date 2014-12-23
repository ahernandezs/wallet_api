var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var requestMoneySchema =  new Schema({
	sender : String,
    destinatary : String,
    amount : Number,
    message : String,
    status : String,
    date : String
}); 

module.exports = mongoose.model('RequestMoney', requestMoneySchema);
