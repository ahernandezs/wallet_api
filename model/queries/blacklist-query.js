var async = require('async');
var moment = require('moment-timezone');
var User = require('../blackListUser');

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search  black list user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, function (err, person) {
    if (err) callback("ERROR",err);
    else{
      callback(null, person);
    }
  });
};
