var Session = require('../session');
var config = require('../../config.js');

exports.createSession = function(session, callback) {
    console.log( 'Creating a new session in MongoDB' );
    Session.insert(session, function(err, result) {
        if (err)
            callback( 'ERROR', { statusCode: 1, message: 'Failed creating the session' } );
        callback( null, { statusCode: 0, message: 'Success creating the session' } );
    });
};

exports.getCredentials = function(sessionid, callback) {
    console.log( 'Getting credentials' );
    Session.findOne( { 'token': sessionid }, 'phoneID pin', function(err, credentials) {
        if (err) {
            callback( 'ERROR', { message: 'Something went wrong' } );
            console.log(err.message);
        } else if (credentials === null)
            callback( 'ERROR', { message: 'No credentials for that token' } );
        else
            callback(null, { data: credentials });
    });
};

exports.updateSession = function(session, info, callback) {
    console.log( 'Updating session in MongoDB');
    var json = {};
    json.token = info.token;
    json.phoneID = info.phoneID;
    json.pin = info.pin;
    var conditions = { _id : info._id };
    Session.update( conditions, json, null, function(err, result) {
        if (err) {
            console.log( 'Failed session update: ' + err );
            callback( 'ERROR', { message: 'Failed session update' } );
        } else {
            console.log( 'Successful update' );
            callback( null, { token: info.token } );
        }
    });
};
