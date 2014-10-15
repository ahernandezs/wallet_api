var soap = require('soap');
var transferFlow = require('../routes/flows/transfer-flow');
var config = require('../config.js');

var soapurl = process.env.SOAP_URL;

exports.saveDoxs = function(payload,callback) {
    var transferDoxs = {phoneID:payload.phoneID,amount:config.doxs[payload.action] ,type:3};
    transferFlow.transferFlow({transferRequest: transferDoxs}, function(err,result){
        console.log('Transfer doxs result: '+JSON.stringify(result)+'\n\n');
        callback(null,result);
    });
}
