/**
 * Created by nemux on 2/10/15.
 */
var nexmo = require('easynexmo');
var notification = require('./notification-service');
var config = require('../config');
var COUNTRY_CODE_USA = '1';
var COUNTRY_CODE_CANADA = '+1';

nexmo.initialize(config.nexmo.key, config.nexmo.secret, config.nexmo.api_protocol, config.nexmo.debug_on);

exports.sendMessage = function(codeArea, to, message, callback){
    //Initialize connection
    opts = {
    'client-ref' : 'AMDOCS2.0-'
    };

    //send message to proxy
    if(codeArea === COUNTRY_CODE_USA || codeArea === COUNTRY_CODE_CANADA ){
        console.log('Send push notification to proxy');
        notification.singlePushToProxy(to,message,function(err,response){
            if (err)
                console.log(err);
            else {
                console.log(to);
                console.log(response);
                callback(null, response);
            }
        });
    }
    //send message to nexmo external service
    else{
        nexmo.sendTextMessage(config.nexmo.from, to, message, opts, function(err, response){
            if (err)
                console.log(err);
            else {
                console.log(to);
                console.log(response);
                callback(null, response);
            }
        });
    }
};



