var Order = require('./order');

exports.validateOrders = function(userID,callback){
	console.log('Search user in mongoDB');
	Order.find({ 'userId': userID }, '_id userId products.name products.quantity products.cost total date status', function (err, person) {
		if (err) return handleError(err); 
		else if(!person)
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'User is not yet registered' });
		else{
			var  response =   { statusCode: 0 ,  additionalInfo: person };
			callback(null, response);
		}
	});
};