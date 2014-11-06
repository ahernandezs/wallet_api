var Receipt = require('../receipt');
var config = require('../../config.js');

exports.createReceipt = function(data, callback) {
    var newReceipt = new Receipt(data);
    var result = newReceipt.save(function(err) {
        if (err) return 1;
        return 0;
    });
    if (result === 1)
        callback('ERROR', 'The receipt could not be created');
    else
        callback(null, 'The receipt was created successfully');
};

exports.getReceipts = function(phoneID, callback){
    console.log('phoneID ' + phoneID);
	Receipt.find({emitter:phoneID},'emitter receiver title amount date type status additionalInfo owner',{sort: {date: -1}},function (err, receipt) {
       if (err) callback('ERROR', err);
       else if(receipt){
          console.log(receipt);
          callback(null, receipt);
      }
      else{
          console.log("receipt not found");
          callback("receipt not found", null);
      }
  });
};

exports.updateReceipt = function(payload,callback){
  var conditions = {_id: payload._id};
    
    if (payload.operation !== undefined) {
      if(payload.operation.toLowerCase() == 'twitter')
        payload = {twitter: 1}
      else if(payload.operation.toLowerCase() == 'facebook')
        payload = {facebook: 1}
      else if(payload.operation.toLowerCase() == 'instagram')
        payload = {instagram: 1}
    }

    Receipt.findByIdAndUpdate(conditions, payload, null, function(err, result) {
        callback(null, result);
  });
};

exports.updateReceiptByOrder = function(payload,callback){
  var conditions = {orderID: payload.orderID};
  Receipt.update(conditions, payload, null, function(err, result) {
    callback(null, result);
  });
};

exports.getReceiptByOrderID = function(orderID,callback){
  Receipt.find({'orderID':orderID},'emitter receiver title amount date type status additionalInfo',{sort: {date: -1}},function (err, receipt) {
       if (err) callback('ERROR', err);
       else if(receipt){
          console.log('Get order');
          console.log(receipt);
          console.log(receipt[0]);
          callback(null, receipt[0]);
      }
      else{
          console.log("receipt not found");
          callback("receipt not found", null);
      }
  });
};

exports.getReceiptByID = function(receiptID,callback){
  Receipt.find({'_id':receiptID},'emitter receiver title amount date type status additionalInfo',{sort: {date: -1}},function (err, receipt) {
       if (err) callback('ERROR', err);
       else if(receipt){
          console.log('Get order');
          console.log(receipt);
          console.log(receipt[0]);
          callback(null, receipt[0]);
      }
      else{
          console.log("receipt not found");
          callback("receipt not found", null);
      }
  });
};

exports.getIdPhone = function(payload,callback){
  Receipt.findOne({_id: payload.id},'emitter',function (err, result) {
    callback(null, result.emitter)
  });
};

exports.updateReceiptStatus = function(payload,callback){
  var conditions = {_id: payload.id};
  var payload = {status: payload.status};
  Receipt.update(conditions, payload, null, function(err, result) {
    callback(null, result);
  });
};

exports.getLastReceipt = function(payload, callback) {
    console.log('Get last receipt for ' + payload.loanID);
    var conditions = { emitter : payload.phoneID, type : payload.type, loanID: payload.loanID };
    Receipt.findOne(conditions, 'emitter receiver amount message additionalInfo title date type status loanID', function(err, receipt) {
        if(err)
            callback('ERROR', receipt);
        else
            callback(null, receipt);
    });
};

exports.getSocialNetworks = function(receiptID, callback){
  Receipt.findOne({'_id':receiptID}, 'twitter facebook', function (err, receipt) {
       if (err) callback('ERROR', err);
       else if(receipt){
          callback(null, receipt);
      }
      else{
          console.log("receipt not found");
          callback("receipt not found", null);
      }
  });
}
