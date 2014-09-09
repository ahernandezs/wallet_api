var Order = require('./order');

exports.validateOrders = function(userID,callback){
	console.log('Search user in mongoDB');
	Order.find({ 'userId': userID }, '_id userId products.name products.quantity products.cost total date status', function (err, person) {
		if (err) return handleError(err); 
		console.log(person);
		callback(null,person);
	});
};