var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema =  new Schema({
	_id: Number ,
    products: [ {type: Schema.ObjectId, ref:'productSchema' ,
				 quantity : String ,
				 cost : Number }
			  ] ,
	total : Number ,
	date : String
});

module.exports = mongoose.model('Order', orderSchema);


