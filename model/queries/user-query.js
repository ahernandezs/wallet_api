var User = require('../user');
var config = require('../../config.js');

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
  var conditions = { 'phoneID': payload.phoneID }
  var propPhoneID = 'phoneID';
  delete payload[propPhoneID];
  var update = payload ;
  console.log(payload);
  User.update(conditions, payload, null, function(err, result) {
    if (err) callback("ERROR", { statusCode: 1,  message: 'Update Fail' });
    callback(null, { statusCode: 0 ,  additionalInfo: result });
  });
};

exports.findAppID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'appID OS', function (err, person) {
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

exports.putDoxs = function(payload, callback){

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
  User.findOne({ 'phoneID': phoneID }, 'pin', function (err, person) {
    if (err) return handleError(err);
    else if(person){
      console.log(person);
      callback(null, person.pin);
    }
    else{
      console.log("user not found");
      callback("USER NOT FOUND", null);
    }
  });
};
