var Session = require('../session');
var config = require('../../config.js');
var async = require('async');

exports.createSession = function(session, callback) {
    console.log( 'Creating a new session in MongoDB' );
    Session.update( { 'phoneID': session.phoneID }, session, { upsert: true }, function(err, result) {
        if (err)
            callback('ERROR', { message: 'Failed registering session' } );
        else
            callback(null, { message: 'Success registering session' });
    });
};


exports.getSessionByPhoneID = function(phoneID, callback) {
    console.log( 'Getting session using phoneID' );
    Session.findOne( { 'phoneID': phoneID },'token', function(err, result) {
        if (err)
            callback('ERROR', 'error to get session token' );
        else{
            console.log('Imprimiendo token');
            console.log(result);
            callback(null, result);
        }
    });
};

exports.getCredentials = function(session, callback) {
    console.log( 'Getting credentials' );
    async.waterfall([
        function(callback) {
            Session.findOne( { 'token': session.sessionid }, 'phoneID pin group', function(err, credentials) {
                if (err) {
                    callback( 'ERROR', { message: 'Something went wrong' } );
                    console.log(err.message);
                } else if (credentials === null)
                    callback(null, { statusCode : 1, message: 'No credentials for that token' } );
                else
                    callback('STOP', { data: credentials });
            });
        },
        function(response, callback) {
            Session.findOne( { 'phoneID': session.phoneID }, 'pin group', function(err, credentials) {
                if (err) {
                    callback( 'ERROR', { message: 'Something went wrong' } );
                    console.log(err.message);
                } else if (credentials === null)
                    callback('ERROR', response);
                else
                    callback(null, { data: { phoneID : session.phoneID, pin : credentials.pin, group : credentials.group } });
            });
        }
    ], function(err, result) {
        if (err) 
            callback(err, result);
        else
            callback(null, result);
    });
};

exports.updateSession = function(session, info, callback) {
    console.log( 'Updating session in MongoDB');
    var json = {};
    json.token = info.token;
    json.phoneID = info.phoneID;
    json.pin = info.pin;
    json.group = info.group;
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

exports.getSessions = function(group, callback){
    Session.find({group: group}, function(err, res){
        callback(null, res.length);
    });
}

exports.getSession = function(phoneID, callback){
    Session.findOne({'phoneID': phoneID}, function(err, session){
        console.log('getSession  '+ JSON.stringify(session));
        callback(null, session);
    });
}
