var RequestMoney = require('../requestMoney');
var config = require('../../config.js');

exports.createRequest = function(data, callback) {
    console.log(data);
    var request = new RequestMoney(data);
    request.save(function(err, result) {
        if (err)
            callback('ERROR', 'The request could not be created.');
        else
            callback(null, result._id);
    });
};

exports.getSingleRequest = function(requestID, callback) {
    RequestMoney.findOne( { '_id' : requestID }, function(err, result) {
       if (err)
           callback('ERROR', 'The request was not found');
        else
            callback(null, result);
    });
};

exports.updateRequest = function(data, callback) {
    var conditions = { '_id' : data._id };
    var request = { sender : data.sender, destinatary : data.destinatary, amount : data.amount, message : data.message,
                    status : data.status, date : data.date };
    RequestMoney.findOneAndUpdate( conditions, request, function(err, result) {
       if (err)
           callback('ERROR', 'There was an error updating the requestMoney.');
        else
            callback(null, result);
    });
};
