var Merchant = require('../merchant');
var User = require('../user');
var sessionQuery = require('./session-query');
var config = require('../../config.js');
var async = require('async');


exports.getMerchanByID = function(merchantID, callback) {
    console.log( 'Get Merchan By ID: ' + merchantID);
    Merchant.find({ 'id': merchantID }, 'appID OS group', function(err, merchant)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.merchants.errMsg };
            callback("ERROR: " + err.message, response);
        } else if (merchant.length === 0) {
            response = { statusCode: 0, additionalInfo: config.merchants.emptyMsg }
            callback(null, response);
        } else {
            callback(null, merchant[0]);
        }
    });
};

exports.getMerchanByAppID = function(appID, callback) {
    console.log( 'Get Merchan By AppID: ' + appID);
    Merchant.find({ 'appID': appID }, 'appID OS environment', function(err, merchant)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: config.merchants.errMsg };
            callback("ERROR: " + err.message, response);
        } else if (merchant.length === 0) {
            response = { statusCode: 0, additionalInfo: config.merchants.emptyMsg }
            callback(null, response);
        } else {
            callback(null, merchant[0]);
        }
    });
};


exports.updateMerchanByID = function(payload, callback) {
    console.log( 'Update Merchan with ID: ' + payload.id);
    var conditions ={ id : payload.id};
    var payload = payload;
    Merchant.update(conditions, payload, null, function(err, result) {
        if (err) callback("ERROR", { statusCode: 1,  message: 'register failed' });
        callback(null, { statusCode: 0 ,  additionalInfo: 'register succesful' });
    });
};

exports.getMerchands = function(phoneID, callback){

    async.waterfall([
      function(callback){
        if(phoneID)
            User.findOne({'phoneID': phoneID }, 'group', function (err, user) {
                if(user.group)
                    callback(null, user.group);
            });
        else
            callback(null,config.group.env.INTERNAL);
      },
      function(group, callback){
        if(group){
            sessionQuery.getSessions(group, function(err, users){
              callback(null, users);
            });
        }
      },
      function(users, callback){

        var  query = Merchant.find();
        query.sort({id:1});
        query.exec(function(err,data){
          console.log(data[0]);
          data[0].usersConnected = users;
          callback(null, data);
        });
      },
      function(data, callback){
        dateTime = new Date().getHours();
        var tmp = data[0].schedule.split('-');


        var openTime = parseInt(tmp[0].replace('am', '').replace(' ', ''));
        var closeTime = parseInt(tmp[1].replace('pm', '').replace(' ', '')) + 12;

        if(dateTime>=openTime && dateTime<closeTime){
            data[0].open = 1;
        }else{
            data[0].open = 0;
        }
        callback(null, data);
      }
    ], function (err, result){
        callback(null,result);
    });

};
