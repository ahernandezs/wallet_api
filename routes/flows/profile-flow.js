var async = require('async');
var moment = require('moment-timezone');
var config = require('../../config.js');
var User = require('../../model/user');
var transacctionQuery = require('../../model/queries/transacction-query');
var doxsService = require('../../services/doxs-service');

exports.updateProfile = function(payload,callback) {
	async.waterfall([

		function(callback){
	        
	        var transacction = {};
	        transacction.title = 'Update Profile';
	        transacction.date = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);;
	        transacction.type = 'DOX',
	        transacction.amount = config.doxs.profile;
	        transacction.description = 'Ha ganado algunos puntos DOX por completar su perfil!'
	        transacction.operation = 'Actualización de perfil';
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

	    function(callback){
	      console.log(payload.sessionid);
	      balance.balanceFlow(payload.sessionid, function(err, result) {
	        if(err){
	          var response = { statusCode: 1, additionalInfo: result };
	          callback('ERROR', response);
	        }
	        else{
	          console.log(result);
	          result.additionalInfo.doxAdded = config.doxs.profile;
	          callback(null,result);
	        }
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
