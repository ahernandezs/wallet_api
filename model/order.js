var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema =  new Schema({
	_id: Number ,
    products: [  ,
				 quantity : String ,
				 cost : Number }
			  ] ,
	total : Number ,
	status : Number ,
	date : String
});

module.exports = mongoose.model('Order', orderSchema);
