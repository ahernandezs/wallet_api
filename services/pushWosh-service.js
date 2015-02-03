var https = require('https');

var options = {
  host: 'cp.pushwoosh.com',
  path: '/json/1.3/createMessage',
  method: 'POST'
};


var httpRequest = https.request(options, function(res) {  
  console.log('starting request');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
})

var request = {};
request.application = '98BF1-8CB13';
request.auth = 'TwMGS2EoXPu9iDcbGncSHrcePHFClrVvkX8aCBRbBaorJYDEd0f8rZbrj912uTgPuiaqfMl856nLK9Xw90tj';
var notifications = [];
var devices = [];
//appID
devices.push('626349bfcef5cf14');

notifications.push({
'devices' : devices ,  
send_date : 'now',
ignore_user_timezone : true,
content : 'Test from nodejs ',
data: { action:1 ,additionalInfo:'value for key 1'}
});
request.notifications = notifications;
var requestWrapper = {'request': request};
console.log(JSON.stringify(requestWrapper));
console.log('-----------------------------');

httpRequest.write(JSON.stringify(requestWrapper));
httpRequest.end();
console.log('Finish');
