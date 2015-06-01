var soap = require('soap');
var transferFlow = require('../routes/flows/transfer-flow');
var config = require('../config.js');
var mubsub = require('mubsub');
var userQuery = require('../model/queries/user-query');
var blacklist = require('../black-list.js');

var client = mubsub(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||   'mongodb://localhost/amdocs');
var channel = client.channel('leaderboard_channel');

client.on('error', console.error);
channel.on('error', console.error);

exports.saveDoxs = function(payload,callback) {
	console.log('Transfering DOX ....');
    console.log(blacklist);
    //if (blacklist.indexOf(payload.phoneID) > -1) {
    //    console.log('In blacklist');
    //    var response = { statusCode:0 ,  additionalInfo : "Successful" };
    //    callback(null,response);
    //} else {
        var transferDoxs = {phoneID:payload.phoneID,amount:config.doxs[payload.action] ,type:3};
        console.log(transferDoxs);
        transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
            console.log('Transfer doxs result: '+JSON.stringify(result)+'\n\n');
            setTimeout(function() {
                channel.publish('leaderboard_update',{result:'OK'});
            }, 3000);
            callback(null,result);
        });
    //}
}
