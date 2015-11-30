var async = require('async');
var moment = require('moment-timezone');
var User = require('../blockUser');

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search  user in block list');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, function (err, person) {
    if (err) callback("ERROR",err);
    else{
      callback(null, person);
    }
  });
};