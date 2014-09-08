var User = require('./user');

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
  user.pin = user.new_pin ;
  user.email = user.email_address;
  console.log(user);
  var userToPersist = new User(user);
  console.log('User to persist user' + userToPersist);
  userToPersist.save(function (err) {
    if (err) callback("ERROR", { statusCode: 1,  message: 'Error to register user' });
	callback(null, { statusCode: 0 ,  message: 'User registered correctly' }); ;
  });
};


exports.findAppID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  User.findOne({ 'phoneID': phoneID }, 'appID', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  message: 'User not  Found' });
    else{
      callback(null, person.appID);
    }
  });
};
