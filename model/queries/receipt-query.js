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
	Receipt.find({emitter:phoneID},'emitter receiver title amount date type status',{sort: {date: -1}},function (err, receipt) {
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
