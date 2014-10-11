var Receipt = require('../receipt');
var config = require('../../config.js');

exports.createReceipt = function(data, callback) {
    var newReceipt = Receipt(data);
    var result = newReceipt.save(function(err) {
        if (err) return 1;
        return 0;
    });
    if (result === 1)
        callback('ERROR', 'The receipt could not be created');
    else
        callback(null, 'The receipt was created successfully');
};

exports.getReceipt = function(data, callback){
	Receipt.find({'_id':data.id},function (err, receipt) {
		callback(null, receipt);
	});
};
