var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema =  new Schema({
	userId: Number,
    products: [ {name: String,
				 quantity : String ,
				 cost : Number }
			  ] ,
	total : Number ,
	date : String, 
	status: String
}); 

module.exports = mongoose.model('Order', orderSchema);
