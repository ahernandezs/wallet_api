var Prize = require('../prize');

exports.getPrizes =  function(callback) {
    Prize.find({}, 'imgUrl description' , function(err, response)  {
        callback(null, response);
    });
};
