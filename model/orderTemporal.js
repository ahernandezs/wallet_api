var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema =  new Schema({
	orderId: Number,
	userId: String,
    merchantId: Number,
    customerImage: String,
    customerName: String,
    products: [ {name: String,
				 quantity : String ,
				 cost : Number }
			  ] ,
	total : Number ,
	date : String, 
	status: String
}); 

module.exports = mongoose.model('OrderTemporal', orderSchema);
