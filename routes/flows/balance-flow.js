var async = require('async');
var soap = require('soap');
var crypto = require('crypto');
var Userquery = require('../../model/queries/user-query');
var sessionQuery = require('../../model/queries/session-query');
var soapurl = process.env.SOAP_URL;
var soapurlNew = process.env.SOAP_URL_NEW;

exports.balanceFlow = function(sessionid,callback) {
  console.log('Execute balance Flow');
  async.waterfall([

    function(callback){
      console.log('Get credentials .........ss'+sessionid);
      var requestSession = { 'sessionid' :  sessionid };
      sessionQuery.getCredentials(requestSession,function(err,user){
         if(err) {
            console.log('Error to get credentials ' )
            console.log(user);
            callback(null,user.data);
          } else {
            console.log('Obteniendo usuarios');
            console.log(user);
            callback(null,user)
          }
      });
    },
    function(user,callback){
      console.log('balance Points Wallet.........');
          var currentMoney, currentDox;
          console.log(user)
          soap.createClient(soapurlNew, function(err, client) {
            client.setSecurity(new soap.WSSecurity( user.phoneID,user.pin,'PasswordDigest'));
            client.Balance({}, function(err, result) {
              if(err) {
                console.log('balance  error .........');
                console.log(err);
                return new Error(err);
              } else {
                console.log(JSON.stringify(result.wallets.wallet));
                if(result.result  === '0' ) {
                  console.log('balance .........');
                  console.log(result.wallets.wallet[0].attributes.id);
                  if(result.wallets.wallet[0].attributes.id){
                    if(result.wallets.wallet[0].attributes.id === 'wallet.ewallet')
                      currentMoney = result.wallets.wallet[0].current.attributes.amount
                    else
                      currentMoney = result.wallets.wallet[1].current.attributes.amount
                  }

                  if(result.wallets.wallet[1].attributes.id){
                    if(result.wallets.wallet[1].attributes.id === 'wallet.points')
                      currentDox = result.wallets.wallet[1].current.attributes.amount
                    else
                      currentDox = result.wallets.wallet[3].current.attributes.amount;                      
                  }

                  console.log(currentDox);
                  console.log(currentMoney);
                  var balance = { current : currentMoney  , dox : currentDox} ;
                  response = { statusCode:0  ,  additionalInfo : balance };
                }
                else
                  var response = { statusCode:1 ,  additionalInfo : response };
                callback(null,response);
              }
            });
          });
    },
    ], function (err, result) {
      console.log('Return Balance .........');
      if(err){      
        callback(err,result);    
      }else{
        callback(null,result);    
      }  
    });
};


Array.prototype.myFind = function(obj) {
    return this.filter(function(item) {
        for (var prop in obj)
            if (!(prop in item) || obj[prop] !== item[prop])
                 return false;
        return true;
    });
};

