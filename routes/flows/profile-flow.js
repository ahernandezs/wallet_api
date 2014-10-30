var async = require('async');
var config = require('../../config.js');
var User = require('../../model/user');
var transacctionQuery = require('../../model/queries/transacction-query');
var doxsService = require('../../services/doxs-service');

exports.updateProfile = function(payload,callback) {
	async.waterfall([

		function(callback){
	        
	        var transacction = {};
	        transacction.title = 'Update Profile';
	        transacction.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	        transacction.type = 'DOX',
	        transacction.amount = config.doxs.profile;
	        transacction.description = 'You had earned some doxs points for completing your profile!'
	        transacction.operation = 'Update profile';
	        transacction.phoneID = payload.phoneID;	
	        transacctionQuery.createTranssaction(transacction, function(err, result) {
				if(err) {
					return new Error(err);
				} else {
					callback(null);
				}
            });
		},

		function(callback){

			console.log('updating doxs in utiba');
            var payloadoxs = {phoneID: payload.phoneID, action: 'profile', type: 3}
            doxsService.saveDoxs(payloadoxs, function(err, result){
              if(err) {
                return new Error(err);
              } else {
                callback(null, result);
              }
            });
		},

		function(callback){
			var updateDoxs = {phoneID: payload.phoneID, operation: 'profile', sessionid:payload.sessionid};
			console.log('Saving doxs in mongo');
			Userquery.putDoxs(updateDoxs, function(err,result){
				callback(null);
			});
		},

/*		function(callback){

			var puntos = config.doxs['profile'];
			var query = { 'phoneID': payload.phoneID };
			var update = { $inc : {doxs:puntos} };
			var options = { new: false };

			User.findOneAndUpdate(query, update, options, function (err, person) {
				if (err) return handleError(err);
					callback(null);
			});
		},
*/

	], function(err, result) {
	    if (err) 
	        callback(err, result);
	    else
	        callback(null, result);   
	});
}
