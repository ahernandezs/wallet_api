var async = require('async');
var User = require('../user');
var config = require('../../config.js');
var balance = require('../../routes/flows/balance-flow');
var transfer = require('../../routes/flows/transfer-flow');
var doxsService = require('../../services/doxs-service');

exports.validateUser = function(phoneID,callback){
	console.log('Search user in mongoDB');
	User.findOne({ 'phoneID': phoneID }, 'name 	email pin	phoneID appID', function (err, person) {
		if (err) return handleError(err); 
		else if(!person)
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'User is not yet registered' });
		else{
			var  response =   { statusCode: 0 ,  additionalInfo: person };
			callback(null, response);
		}	
	});
};

exports.createUser = function(user,callback){
  console.log("Saving User in MongoDB");
  var propSessionID = "sessionid";
  delete user[propSessionID];
  var propInitiator = "initiator";
  delete user[propInitiator];
  user.email = user.email_address;
  console.log(user);
  var userToPersist = new User(user);
  console.log('User to persist user' + userToPersist);
  userToPersist.save(function (err) {
    if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to register user' });
  	  callback(null, { statusCode: 0 ,  additionalInfo: 'User registered correctly' }); ;
  });
};


exports.updateUser = function(payload,callback){

  async.waterfall([

    function(callback){
      var conditions = { 'phoneID': payload.phoneID }
      User.update(conditions, payload, null, function(err, result) {
        callback(null);
      });
    },

    function(callback){
      var updateDoxs = {phoneID: payload.phoneID, operation: 'profile'};
      putDoxs(updateDoxs, function(err,result){
        callback(null);
      });
    },

    function(callback){
      var payloadoxs = {phoneID: payload.phoneID, action: 'profile', type: 3}
      doxsService.saveDoxs(payloadoxs, function(err, result){
        if(err) {
          return new Error(err);
        } else {
          callback(null);
        }
      });
    },

    function(callback){
      balance.balanceFlow(payload.sessionid, function(err, result) {
        if(err){
          var response = { statusCode: 1, additionalInfo: result };
          callback('ERROR', response);
        }
        else
          result.additionalInfo.doxAdded = config.doxs.profile;
          callback(null,result);
      });
    },

  ], function (err, result) {
    console.log('Return Update User');
    if(err){      
      callback(err,result);    
    }else{
      callback(null,result);    
    }  
  });
};

exports.findAppID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'appID OS name ', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'name', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.getIdByPhoneID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, '_id', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.getDoxs = function(phoneID, callback){
  User.findOne({ 'phoneID': phoneID }, 'doxs', function (err, person) {
    if (err) return handleError(err);
    else if(!person){
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    }else
      callback(null, person.doxs);
  });
};


var putDoxs = exports.putDoxs = function(payload, callback){

  var puntos = config.doxs[payload.operation];
  var query = { 'phoneID': payload.phoneID };
  var update = { $inc : {doxs:puntos} };
  var options = { new: false };

  User.findOneAndUpdate(query, update, options, function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person.doxs);
  });
};


exports.confirmPin = function(phoneID, callback){
  console.log('Confirm Pin');
    console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'pin email company name profileCompleted', function (err, person) {
    if (err) return handleError(err);
    else if(person){
      console.log(person);
      callback(null, person);
    }
    else{
      console.log("user not found");
      callback("USER NOT FOUND", null);
    }
  });
};

exports.getUsers = function(callback){
  User.find({}, 'phoneID name email lastSession', { sort : { lastSession : -1 }}, function (err, people) {
    if (err) return handleError(err);
    else if(people){
      callback(null, people);
    }
    else{
      console.log("users not found");
      callback("USERS NOT FOUND", null);
    }
  });
}

exports.getName = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'name', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.updateSession = function(user, callback) {
    console.log( 'Adding timestamp to session' );
    var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    User.update( { 'phoneID' : user.phoneID }, { $set : { 'lastSession' : now } }, function(err, result) {
        if (err)
            callback('ERROR', { message: 'Failed updating session' });
        else
            callback(null, { message: 'Successful updating session' });
    });
};

exports.getLeaderboard = function(callback){
  User.find({}, 'phoneID name doxs', {sort: {doxs: -1}}, function (err, people) {
    if (err) return handleError(err);
    else if(people){
      callback(null, people);
    }
    else{
      console.log("users not found");
      callback("USERS NOT FOUND", null);
    }
  });
}
