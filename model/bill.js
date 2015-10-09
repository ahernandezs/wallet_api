/**
 * Created by nemux on 8/10/15.
 */
var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var billSchema = new Schema({
    billId: String,
    createdAt: Date,
    minPayDate: Date,
    maxPayDate: Date,
    total: Number,
    issuer: String,
    clientId: String,
    accountNumber:String,
    invoiceNumber:String
});


billSchema.statics.getBill = function(billId, callback){
    return this.findOne({'billId':billId},{ '_id': false},callback);
};

module.exports = mongoose.model('bill', billSchema);
