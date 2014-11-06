var Enviroment = require('../enviroment');

exports.getUrl = function(env,callback){
	console.log('Search url in mongoDB');
	Enviroment.findOne({ 'env': env }, function (err, response) {
		callback(null, response.url);
	});
};

exports.save = function(callback){
	var env = new Enviroment({env: 'INTERNAL', url: 'http://www.amdocs.co'});
	env.save(function(err, res){
		callback(null);
	});
};
