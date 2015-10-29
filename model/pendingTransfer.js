/**
 * Created by nemux on 28/10/15.
 */
var mongoose = require ('mongoose');
var Schema =  mongoose.Schema;

var pendingTransfer = new Schema({
    date: Date,
    amount: Number,
    sender: String,
    receiver: String,
    operation:String,
    message:String
});

/*
pendingTransfer.statics.getBill = function(billId, callback){
    return this.findOne({'billId':billId},{ '_id': false},callback);
};
*/
pendingTransfer.statics.getPendingTransfers = function(phoneID, callback){
    this.find({receiver:phoneID},function(err,transfers){
        if (err){
            callback(true,{statusCode:4,additionalInfo:{message:"UNAVAILABLE DATABASE SERVICE"}});
        } else
            this.remove({receiver:phoneID},function(err,result){
                callback(err,result,transfers);
        });
    });
};

module.exports = mongoose.model('pendingTransfer', pendingTransfer);
