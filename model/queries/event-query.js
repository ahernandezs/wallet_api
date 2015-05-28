var eventModel = require('../event');

exports.getEvents = function(callback){
	console.log('Search events in mongoDB');
	eventModel.find({}, 'eventTitle date place imageBanner prices',function (err, response) {
		if(err){
			console.log(err);
		}else{
			console.log('Resultado')
			callback(null, response);
		}
	});
};
