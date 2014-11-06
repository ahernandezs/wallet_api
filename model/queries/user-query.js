var async = require('async');
var User = require('../user');
var config = require('../../config.js');
var balance = require('../../routes/flows/balance-flow');
var transfer = require('../../routes/flows/transfer-flow');
var profileFlow = require('../../routes/flows/profile-flow');
var doxsService = require('../../services/doxs-service');
var mailService = require('../../services/sendGrid-service');
var transacctionQuery = require('../../model/queries/transacction-query');
var sessionQuery = require('./session-query');
var soap = require('soap');
var soapurl = process.env.SOAP_URL;
var Userquery = require('../../model/queries/user-query');

exports.validateUser = function(phoneID,callback){
	console.log('Search user in mongoDB');
	User.findOne({ 'phoneID': phoneID }, 'name 	email pin	phoneID appID', function (err, person) {
		if (err) return handleError(err); 
		else if(!person)
			callback("ERROR", { statusCode: 1 ,  additionalInfo: 'User is not yet registered' });
		else{
			var  response =   { statusCode: 0 ,  additionalInfo: person };
			callback(null, response);
		}	
	});
};

exports.createUser = function(user,callback){
  console.log("Saving User in MongoDB");
  var propSessionID = "sessionid";
  delete user[propSessionID];
  var propInitiator = "initiator";
  delete user[propInitiator];
  user.email = user.email_address;
  console.log(user);
  var userToPersist = new User(user);
  console.log('User to persist user' + userToPersist);

  if(user.email_address)
    mailService.sendRegisterMessage(user, function(err, result) {
      if (err)
        callback('ERROR', { statusCode : 1, additionalInfo : result } );
      else
        userToPersist.save(function (err) {
          if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to register user' });
          callback(null, { statusCode: 0 ,  additionalInfo: 'User registered correctly' });
        });
    });
};

exports.singleUpdateUser = function(payload,callback){
  var conditions = { 'phoneID': payload.phoneID }
  User.update(conditions, payload, null, function(err, result) {
    if(err) {
      return new Error(err);
    } else {
      callback(null);
    }
  });
}

exports.updateUser = function(payload,callback){

  async.waterfall([

    function(callback){
      payload.email = payload.email_address;
      var conditions = { 'phoneID': payload.phoneID }
      User.update(conditions, payload, null, function(err, result) {
        callback(null);
      });
    },

    function(callback){
      if(payload.profileCompleted === 1){
        var transacction = {};
        transacction.title = 'Update Profile';
        transacction.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        transacction.type = 'DOX',
        transacction.amount = config.doxs.profile;
        transacction.description = 'You had earned some doxs points for completing your profile!'
        transacction.operation = 'Update profile';
        transacction.phoneID = payload.phoneID;
        transacctionQuery.createTranssaction(transacction, function(err, result) {

          var payloadoxs = {phoneID: payload.phoneID, action: 'profile', type: 3}
          doxsService.saveDoxs(payloadoxs, function(err, result){
            if(err) {
              return new Error(err);
            } else {
              callback(null);
            }
          });
        });
      }else
      callback(null);
    },

    function(callback){
      if(payload.profileCompleted === 1){
        var updateDoxs = {phoneID: payload.phoneID, operation: 'profile', sessionid: payload.sessionid};
        putDoxs(updateDoxs, function(err,result){
          callback(null);
        });
      }else
      callback(null);
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

    ], function (err, result) {
      console.log('Return Update User');
      if(err){
        callback(err,result);
      }else{
        callback(null,result);
      }
    });
};

exports.findAppID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'appID OS name environment ', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.findUserByPhoneID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'name email', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.getIdByPhoneID = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, '_id', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.getDoxs = function(phoneID, callback){
  User.findOne({ 'phoneID': phoneID }, 'doxs', function (err, person) {
    if (err) return handleError(err);
    else if(!person){
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    }else
    callback(null, person.doxs);
  });
};

var putDoxs = exports.putDoxs = function(payload, callback){

  async.waterfall([

    //consultar doxs en utiba
    function(callback){
      console.log('the sessionid: '+payload.sessionid);
      balance.balanceFlow(payload.sessionid, function(err, result) {
        if(err){
          callback('ERROR', response);
        }
        else{
          callback(null, result.additionalInfo.dox);
        }
      });
    },

    //salvar numero de doxs en mongo
    function(doxs, callback){

      var query = { 'phoneID': payload.phoneID };
      var update = { 'doxs': doxs };
      var options = { new: false };
      User.findOneAndUpdate(query, update, options, function (err, person) {
        if (err) return handleError(err);
        else if(!person)
          callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
        else
          callback(null, person.doxs);
      });

    }

    ], function (err, result) {
      if(err){
        callback(err,result);
      }else{
        callback(null,result);
      }
    });
};

exports.confirmPin = function(phoneID, callback){
  console.log('Confirm Pin');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'pin email company name profileCompleted', function (err, person) {
    if (err) return handleError(err);
    else if(person){
      console.log(person);
      callback(null, person);
    }
    else{
      console.log("user not found");
      callback("USER NOT FOUND", null);
    }
  });
};

exports.getUsers = function(parameters,callback){
  if(parameters.phoneID){
    User.findOne({'phoneID': parameters.phoneID }, 'group', function (err, user) {
      if (err) return handleError(err);
      else if(user){
        User.find({group:user.group }, 'phoneID name email lastSession', { sort : { lastSession : -1 }}, function (err, people) {
          if (err) return handleError(err);
          else if(people){
            callback(null, people);
          }
          else{
            console.log("users not found");
            callback("USERS NOT FOUND", null);
          }
        });
      }// end else if
      else{
        User.find({}, 'phoneID name email lastSession', { sort : { lastSession : -1 }}, function (err, people) {
          if (err) return handleError(err);
          else if(people){
            callback(null, people);
          }
          else{
            console.log("users not found");
            callback("USERS NOT FOUND", null);
          }
        });
      }
    });
  }//end of if
  else{
    User.find({}, 'phoneID name email lastSession', { sort : { lastSession : -1 }}, function (err, people) {
      if (err) return handleError(err);
      else if(people){
        callback(null, people);
      }
      else{
        console.log("users not found");
        callback("USERS NOT FOUND", null);
      }
    });
  }//end else
};

exports.getName = function(phoneID,callback){
  console.log('Search user in mongoDB');
  console.log(phoneID);
  User.findOne({ 'phoneID': phoneID }, 'name', function (err, person) {
    if (err) return handleError(err);
    else if(!person)
      callback("ERROR", { statusCode: 0 ,  additionalInfo: 'User not  Found' });
    else
      callback(null, person);
  });
};

exports.updateSession = function(user, callback) {
  console.log( 'Adding timestamp to session' );
  var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  User.update( { 'phoneID' : user.phoneID }, { $set : { 'lastSession' : now } }, function(err, result) {
    if (err)
      callback('ERROR', { message: 'Failed updating session' });
    else
      callback(null, { message: 'Successful updating session' });
  });
};

exports.getLeaderboard = function(phoneIDUser,callback){

  User.findOne({phoneID:phoneIDUser},'group',function(err,result){
    if (err)
      callback('ERROR', { message: 'Fail  getLeaderboard' });
    else{
      if(result.group){
        var query = User.find({group:result.group}, 'phoneID name doxs', {sort: {doxs: -1}});
        query.limit(15);
        query.exec(function (err, people) {
          if (err) return handleError(err);
          else if(people){
            callback(null, people);
          }
          else{
            console.log("users not found");
            callback("USERS NOT FOUND", null);
          }
        });
      }else{
          callback(null,[]);
      }
    }
  });
};

exports.inviteFriend = function(payload, callback){

  async.waterfall([

    function(callback){
      mailService.sendInvitation(payload,function(err,result){
        if (err) callback('ERROR', {statusCode:1, additionalInfo:err});
        callback(null);
      });
    },

    function(callback){
      var payloadoxs = {phoneID: payload.phoneID, action: 'social', type: 3}
      doxsService.saveDoxs(payloadoxs, function(err, result){
        console.log('Transfer result: '+JSON.stringify(result)+'\n\n');
        if(err) {
          return new Error(err);
        } else {
          callback(null);
        }
      });
    },

    function(callback){
      var updateDoxs = {phoneID: payload.phoneID, operation: 'social', sessionid:payload.sessionid};
      console.log('Saving doxs in mongo');
      Userquery.putDoxs(updateDoxs, function(err,result){
        callback(null);
      });
    },

    function(callback){
      console.log('balance e-wallet');
      sessionid = payload.sessionid;
      var request = { sessionid: sessionid, type: 1  };
      request = {balanceRequest: request};
      soap.createClient(soapurl, function(err, client) {
        client.balance(request, function(err, result) {
          if(err) {
            return new Error(err);
          } else {
            response = result.balanceReturn;
            if(response.result  === '0' )
              response = { statusCode:0 ,sessionid : sessionid ,  additionalInfo : response };
            else
              response = { statusCode:1 ,  additionalInfo : response };

            callback(null, response);
          }
        });
      });
    },


  ], function (err, result) {
    if(err){
      callback(err,result);
    }else{
      callback(null,result);
    }
  });
};
