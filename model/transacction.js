var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var transacctionSchema =  new Schema({
	title:String,
	date : String,
	type: String,
	amount: String,
	description : String,
	additionalInfo : String,
	operation:String ,
	phoneID:String,
	creditMoney:String
});

transacctionSchema.statics.getLastTransaction = function(phoneID, operation, callback){
	this.find({'phoneID':phoneID, 'operation':operation},{ '_id': false},function(err, transactions){
		var transactions = JSON.parse(JSON.stringify(transactions));
		if(err){
			console.log("ERROR, NO DATA");
			callback(true,null);
		}
		if(!transactions){
			console.log("OK NO DATA");
			callback(null,null);
		}

		for(var i = 0; i < transactions.length; i++){
			var fecha = new Date(transactions[i].date);
			transactions[i]['fecha'] = fecha;
		}

		transactions.sort(function(t1, t2){
			//Ordering desc
			if (t1.fecha > t2.fecha) return -1;
			if (t1.fecha < t2.fecha) return 1;
			return 0;
		});
		callback(null,transactions[0]);
	});
};

module.exports = mongoose.model('Transacction', transacctionSchema);
