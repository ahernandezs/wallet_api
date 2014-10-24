var couponFlow = require('../routes/flows/coupon-flow');

exports.setCoupon = function(payload, callback){
	couponFlow.setCoupon(payload,function(err, result){
        callback(null,result);
	});
}
