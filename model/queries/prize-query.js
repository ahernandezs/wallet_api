var Prize = require('../prize');
var config = require('../../config.js');

exports.getPrizes =  function(top, callback) {
    var conditions;
    if ( top === config.prizes.top ) {
        conditions = { 'top' : top };
        console.log( 'TOP PRIZE' );
    } else
        conditions = null;
    Prize.find( conditions, 'imgUrl description' , function(err, response)  {
        console.log(response);
        callback(null, response);
    });
};
