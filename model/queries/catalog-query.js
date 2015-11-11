var DoxInfo = require('../doxinfo');
var config = require('../../config.js');

exports.getDoxInfo = function (callback) {
    var query = DoxInfo.find({},'id description amount');
    query.sort({id : 1});
    query.exec(function(err, info) {
       if (err)
           callback('ERROR', err.message);
        else
            callback(null, info);
        console.log(info);
    });
};
