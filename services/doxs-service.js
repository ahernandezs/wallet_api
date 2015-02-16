var soap = require('soap');
var transferFlow = require('../routes/flows/transfer-flow');
var config = require('../config.js');
var mubsub = require('mubsub');
var userQuery = require('../model/queries/user-query');

var client = mubsub('mongodb://localhost:27017/amdocs');
var channel = client.channel('test');

client.on('error', console.error);
channel.on('error', console.error);

exports.saveDoxs = function(payload,callback) {
	console.log('Trasnfering DOX ....');
    var transferDoxs = {phoneID:payload.phoneID,amount:config.doxs[payload.action] ,type:3};
    transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
        console.log('Transfer doxs result: '+JSON.stringify(result)+'\n\n');
        channel.publish('leaderboard_update',{result:'OK'});
		callback(null,result);
    });
}
