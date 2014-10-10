var Prize = require('../prize');

exports.getPrizes =  function(callback) {
    Prize.find({}, function(err, response)  {
        callback(null, response);
    });
};
