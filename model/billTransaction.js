/**
 * Created by nemux on 9/11/15.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var billTransactionSchema = new schema({
    phoneID: String,
    billId : String,
    dateTime: Date
});

module.exports = mongoose.model('bill_transaction',billTransactionSchema);
