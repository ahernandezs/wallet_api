var Enviroment = require('../enviroment');

exports.getUrl = function(env,callback){
	console.log('Search url in mongoDB');
	Enviroment.find({ 'env': env }, 'env url', function (err, response) {
		if (err) return handleError(err);
		callback(null, response);
	});
};
