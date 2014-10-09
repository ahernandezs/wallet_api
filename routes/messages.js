var mongoose = require('mongoose');
var messageQuery = require('../model/queries/message-query');

exports.getMessages = function(req, res) {
    console.log('GET method getMessages');
    console.log( req.headers['x-auth-token'] );
    req.headers.sessionid = req.headers['x-auth-token'];
    var payload = {};
    payload.body = req.body;
    payload.header = req.headers;
    console.log( req.body );
    phoneID ='5FC9731BAA0C4B538A15';
    messageQuery.getMessagesNoRead(phoneID,function(err,result) {
        if(err) {
            res.send(500);
        } else {
            console.log(result);
            res.json(result);
        }
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
};

