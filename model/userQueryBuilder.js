var User = require('./user');

exports.validateUser = function(phoneID,callback){
	console.log('Search user in mongoDB');
	User.findOne({ 'phoneID': phoneID }, 'name 	email pin	phoneID appID', function (err, person) {
		if (err) return handleError(err); 
		else if(person === null)
			callback("ERROR", { code: '0' ,  message: 'User is not yet registered' });
		else{
			var  response = { code: '18' ,  message: 'User is already registered' };
			callback(null, person); 
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
    //if (err) return handleError(err);
    var  response = { code: '0' ,  message: 'User registered correctly' };
    if (err) console.log('Error to persist user ->'+ err);
	callback(null, response); ;
  });
};
