var RequestMoney = require('../requestMoney');
var config = require('../../config.js');

exports.createRequest = function(data, callback) {
    var request = new RequestMoney(data);
    request.save(function(err, result) {
        if (err)
            callback('ERROR', 'The request could not be created.');
        else
            callback(null, result._id);
    });
};
