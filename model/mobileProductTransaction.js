/**
 * Created by nemux on 5/11/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var totalSchema = new Schema({
    type: String,
    amount: Number
});

var mobileProducTransactionSchema = new Schema({
    phoneID: String,
    productID : [Number],
    total: [Schema.Types.Mixed],
    status: String,
    dateTime: Date
});

module.exports = mongoose.model('mobile_product_transaction', mobileProducTransactionSchema);

