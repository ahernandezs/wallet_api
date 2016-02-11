var async = require('async');
var moment = require('moment-timezone');
var BlackListRepository = require('../blackListUser');
var UserRepository = require('../user');

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search  black list user in mongoDB');
  console.log(phoneID);
  BlackListRepository.findOne({ 'phoneID': phoneID }, function (err, person) {
    if (err) callback("ERROR",err);
    else{
      callback(null, person);
    }
  });
};

exports.findAllUsers = function(callback){
  console.log('Searching all users in MongoDB');

  BlackListRepository.find({},function(err, users){

    var blackListUsers = [];

    for (var i = 0; i <  users.length; i++)
      blackListUsers.push(users[i].phoneID);

    console.log(blackListUsers);

    UserRepository.find({phoneID: {$in:blackListUsers}}, {_id:0, phoneID:1, name:1, email:1}, callback);
  });

};
