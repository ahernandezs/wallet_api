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

exports.putOrder = function(order,callback){
	var newOrder = new Order(order);
	newOrder.save(function (err) {
		if (err){
	        console.log(err);
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'Order failed' });
		}else{
			var  response =   { statusCode: 0 ,  additionalInfo: 'Order success' };
			callback(null, response);
		}
	});
}
