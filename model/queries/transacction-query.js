var transacction = require('../transacction');

exports.getTransacctions = function(phoneID, callback) {
    console.log( 'Get Transacctions' );
    transacction.find({type:'MONEY'}, 'title description amount date', function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            console.log('Empty');
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            console.log('Return Collection');
            response = { statusCode: 0, additionalInfo: transacction };
            callback(null, transacction);
        }
    });
};

exports.getTransacctionsDox = function(sessionid, callback) {
    console.log( 'Get Transacctions DOX' );
    transacction.find({type:'DOX'}, 'title amount date', function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            callback(null, transacction);
        }
    });
};

exports.createTranssaction = function(data, callback) {
    console.log('Save transacction');
    var newTransacction = new transacction(data);
    console.log(newTransacction);
    var result = newTransacction.save(function(err) {
        if (err) return 1;
        return 0;
    });
    if (result === 1)
        callback('ERROR', 'The transacction could not be created');
    else
        callback(null, 'The Transacction was created successfully');
};
