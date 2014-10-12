var DoxInfo = require('../doxinfo');
var config = require('../../config.js');

exports.getDoxInfo = function (callback) {
    DoxInfo.find( {}, function(err, info) {
       if (err)
           callback('ERROR', err.message);
        else
            callback(null, info);
        console.log(info);
    });
};
