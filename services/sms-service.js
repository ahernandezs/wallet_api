/**
 * Created by nemux on 2/10/15.
 */
var nexmo = require('easynexmo');
var config = require('../config');

nexmo.initialize(config.nexmo.key, config.nexmo.secret, config.nexmo.api_protocol, config.nexmo.debug_on);

exports.sendMessage = function(to, message, callback){
    //Initialize connection
    opts = {
    'client-ref' : 'AMDOCS2.0-'
    };

    nexmo.sendTextMessage(config.nexmo.from, to, message, opts, function(err, response){
        if (err)
            console.log(err);
        else {
            console.log(response);
            callback(null, response);
        }
    });
};



