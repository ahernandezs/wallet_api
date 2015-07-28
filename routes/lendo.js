var config = require('../config.js');
var hawk = require('hawk');
var rest = require('restler');
var async = require('async');
var loan = require('./flows/loan-flow');

exports.notification = function(req, res) {
    console.log('LENDO POST method notification ');
    console.log(req.body);

    function credentials(id, callback) {
        var webhook_auth = {
            key:'4fS4ah7lnhlzdMTsuRY4sqF5fTHvnx5e',
            algorithm: 'sha256',
            id: id
        };
        console.log(webhook_auth);
        return callback(null, webhook_auth)
    }

    var auth_config = {port: 443, host:'amdocs.anzen.io'};
    hawk.server.authenticate(req, credentials,auth_config, function(err) {
        console.log('Authenticate haw request');
          if(err)
            console.log(err);

        var body = 'WEBHOOK ACCEPTED';
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', Buffer.byteLength(body));
        res.status(200);
        res.end(body);

        //Business logic for incoming events
        var payload = req.body;

        if(payload.event === 'logged_in'){
            loan.processLogin(req.body);
        }

        else if(payload.event === 'has_score'){
            loan.processHasScore(req.body);
        }
    });
};

exports.getPendingLoans = function(req, res) {
    console.log('LENDO GET method pending LOANS ');
    var phoneID = req.headers['x-phoneid'];
    loan.getLenddoPendingLoans(phoneID, function(err, result) {
        res.json(result);
    });
};
