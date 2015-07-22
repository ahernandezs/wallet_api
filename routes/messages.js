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
    var request = { sessionid : req.headers.sessionid, phoneID : req.headers['x-phoneid'] };
    sessionQuery.getCredentials(request, function(err,result){
        messageQuery.getMessages(result.data.phoneID,function(err,result) {
            if(err) {
                res.send(500);
            } else {
                  if(result && result[0] ){
                    var response = { statusCode: 0, additionalInfo: result };
                    res.json(response);
                  }else{
                    var empty = [];
                    var response = { statusCode: 0, additionalInfo: result };
                    res.json(response);
                  }
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

