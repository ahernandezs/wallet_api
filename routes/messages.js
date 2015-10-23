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
            var response = { statusCode: 0 };
            if(err) {
                res.send(500);
            } else {

                var info = JSON.parse(JSON.stringify(result));
                if(info && info[0] ){
                    for(var i = 0; i < info.length; i++){
                        if (info[i].additionalInfo){
                            additionalInfo = info[i].additionalInfo;
                            delete info[i]['additionalInfo'];
                            info[i].additionalInfo = JSON.parse(additionalInfo);
                        }
                    }
                    response.additionalInfo = info;
                  res.json(response);
                }else {
                    response.additionalInfo = result;
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

