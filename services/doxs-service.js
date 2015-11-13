var soap = require('soap');
var transferFlow = require('../routes/flows/transfer-flow');
var config = require('../config.js');
var userQuery = require('../model/queries/user-query');
var blacklist = require('../black-list.js');


exports.saveDoxs = function(payload,callback) {
	console.log('Transfering DOX ....');
    console.log(blacklist);
   if (blacklist.indexOf(payload.phoneID) > -1){
        console.log('In blacklist');
        var response = { statusCode:0 ,  additionalInfo : "Successful" };
        callback(null,response);
    } else {
        var transferDoxs = {phoneID:payload.phoneID,amount:config.doxs[payload.action] ,type:config.wallet.type.DOX};
        console.log(transferDoxs);
        transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
            console.log('Transfer doxs result: '+JSON.stringify(result)+'\n\n');
            callback(null,result);
        });
    }
}
