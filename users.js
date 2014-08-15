var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/amdocs');

exports.login =  function(req, res){
	console.log('execute POST method login');

  console.log(req.body);

  var request = {loginRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);

        var response = result.loginReturn;
        res.json(response);
      }
    });
  });

};


exports.logout = function(req, res){
	var logoutResponse = {
	  username: 'The Reddest',
	  email: 'brandon@switchonthecode.com',
	  firstName: 'Brandon',
	  lastName: 'Cannaday'
	};

	var responseString = JSON.stringify(user);
	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length': userString.length
	};

    res.end(responseString);
};

exports.register = function(req, res){
	console.log("Executing register user operation");
	var user = req.body ;
	console.log(req.body)

	var User = mongoose.model('User',{ name: String , email:String , pin:Number , phoneID:String , appID:String   });

	var userToPersist = new User(req.body);
	console.log('User to persist user' + userToPersist);

	userToPersist.save(function (err) {
	  if (err) 
	  console.log('Error to persist user');
	});
};


