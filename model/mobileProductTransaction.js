/**
 * Created by nemux on 5/11/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mobileProducTransactionSchema = new Schema({
    phoneID: String,
    productID : [Number],
    total: [{type:String,amount:Number}],
    dateTime: Date
});

module.exports = mongoose.model('mobile_product_transaction', mobileProducTransactionSchema);

