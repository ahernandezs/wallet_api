/**
 * Created by nemux on 2/10/15.
 */
var nexmo = require('easynexmo');
var notification = require('./notification-service');
var config = require('../config');

nexmo.initialize(config.nexmo.key, config.nexmo.secret, config.nexmo.api_protocol, config.nexmo.debug_on);

exports.sendMessage = function(to, message, callback){
    //Initialize connection
    opts = {
        'client-ref' : 'AMDOCS2.0-'
    };

    nexmo.sendTextMessage(config.nexmo.from_usa, to, message, opts, function(err, response){
        if (err)
            console.log(err);
        else {
            console.log(to);
            console.log(response);
            callback(null, response);
        }
    });

    /*
     notification.singlePushToProxy(sender,message,function(err,response){
        if (err)
            console.log(err);
        else {
            console.log(to);
            console.log(response);
            callback(null, response);
        }
     });
     */
};



