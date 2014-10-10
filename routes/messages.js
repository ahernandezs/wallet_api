var mongoose = require('mongoose');
var messageQuery = require('../model/queries/message-query');
var sessionQuery = require('../model/queries/session-query');

exports.getMessages = function(req, res) {
    console.log('GET method getMessages');
    console.log( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    console.log( req.body );
    sessionQuery.getCredentials(req.headers.sessionid ,function(err,result){
        console.log(result);
        messageQuery.getMessages(result.data.phoneID,function(err,result) {
            if(err) {
                res.send(500);
            } else {
                console.log(result);
                res.json(result);
            }
        });
    });
};

exports.updateMessage = function(req, res) {
    console.log('PUT method  updateMessage');
    console.log( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    console.log(req.body);
    messageQuery.updateMessage(req.body,function(err,result){
        if(err) {
            res.send(500);
        } else {
            var response = null;
            if(result === 1)
                var response = { statusCode: 0, additionalInfo: 'Update successful' };
            else
                var response = { statusCode: 1, additionalInfo: 'Update Failed' };
            res.json(response);
        }
    });
};

