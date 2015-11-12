var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema =  new Schema({
	orderID: Number,
	customerID: String,
    merchantId: Number,
    customerImage: String,
    customerName: String,
    products: [ {productID: String,
				 quantity : String ,
				 cost : Number }
			  ] ,
	total : Number ,
	totalDox: Number,
	date : String, 
	status: String
}); 

module.exports = mongoose.model('shopOrder', orderSchema);
