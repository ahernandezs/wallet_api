var async = require('async');
var moment = require('moment-timezone');
var BlackListModel = require('../blackListUser');
var UserModel = require('../user');

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search  black list user in mongoDB');
  console.log(phoneID);
  BlackListModel.findOne({ 'phoneID': phoneID }, function (err, person) {
    if (err) callback("ERROR",err);
    else{
      callback(null, person);
    }
  });
};

exports.findAllUsers = function(callback) {

  console.log('Searching all users in MongoDB');
  BlackListModel.find({}, function (err, users) {
    var blackListUsers = [];
    var tempUsers = [];

    if (err)
      return callback(true, 'Error!');

    for (var i = 0, l = users.length; i < l; i++) {
      blackListUsers.push(users[i].phoneID);
      tempUsers.push(users[i].phoneID);
    }

    console.log('ALL BLACKLISTED');
    console.log(blackListUsers);

    UserModel.find({phoneID: {$in: blackListUsers}}, {_id: 0, phoneID: 1, name: 1, email: 1},function(err, usersd){

      if (err)
        return callback(true, 'Error!');

      for (var i = 0, l = usersd.length; i < l; i++) {
        var index = tempUsers.indexOf(usersd[i].phoneID);
        console.log(index)

        if (index > -1)
          tempUsers.splice(index,1);
      }

      console.log('TEMP USERS');
      console.log(tempUsers);


      for (var i = 0, l = tempUsers.length; i < l ; i++){
        var u = {
            phoneID : tempUsers[i],
            name : 'USER NOT REGISTERED',
            email: 'USER NOT REGISTERED'
        };

        usersd.push(u);
      }
      callback(null, usersd);
    });
  });
}

exports.deleteUser = function(phoneId, callback){
  BlackListModel.findOneAndRemove({phoneID: phoneId}, callback);
};

exports.addUser = function(phoneId, callback){

  BlackListModel.findOneAndRemove({ phoneID: phoneId }, function(err, user){
    var blackUser = new BlackListModel({ phoneID: phoneId });

    console.log(blackUser);

    if (err)
      return callback(err,{statusCode:1, additionalInfo: 'Error in DB Service.'});

    blackUser.save(callback);
  });

};