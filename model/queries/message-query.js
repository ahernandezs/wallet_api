var mailService = require('../../services/sendGrid-service');
var Message = require('../message');
var config = require('../../config.js');
var async = require('async');


exports.createMessage = function(sender,message, callback) {
    console.log( 'Persistmessage ');
      var messageToPersist = new Message(message);
      messageToPersist.save(function (err,result) {
        if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to persist message' });
        callback(null, result); ;
     });
};

exports.getMessages = function(phoneID, callback) {
    console.log( 'Getting messages: ' + phoneID);

    async.waterfall([

    function(callback){
      var message = {};
      var condiciones = { 'phoneID': phoneID , message:{ $ne: '' }  ,  $and:[ { type : { $ne : 'REQUEST_MONEY' } } , { type : { $ne : 'GIFT' }  } ] } ; 
      Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs){
          message = msgs;
          callback(null, message);
          }
        });
    },

    function(emptyMessages, callback){
      var condiciones = { 'phoneID': phoneID , type : 'GIFT'  };
      Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs && emptyMessages){
          emptyMessages = emptyMessages.concat(msgs);
          emptyMessages.sort(compare);
          callback(null,emptyMessages);
        }else{
          callback(null,emptyMessages);
        }
      });
    },

    function(emptyMessages, callback){
      var condiciones = { 'phoneID': phoneID , type : 'REQUEST_MONEY'  };
      Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs && emptyMessages){
          emptyMessages = emptyMessages.concat(msgs);
          emptyMessages.sort(compare);
          callback(null,emptyMessages);
        }else{
          callback(null,emptyMessages);
        }
      });
    }

    ], function (err, result){
        callback(null,result);
    });
}

exports.getRequestMoneyMessages = function(phoneID, callback) {
  console.log( 'Getting messages for REQUEST_MONEY ' + phoneID);

  var message = {};
  var condiciones = { 'phoneID': phoneID , type : 'REQUEST_MONEY'  };
  Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {
    if (err) callback('ERROR', err);
    else if(msgs){
      message = msgs;
      callback(null, message);
    }
  });
}

exports.updateMessage = function(message,callback){
    console.log( 'Updating status message in MongoDB');
    var conditions = { _id : message._id };
    Message.update( conditions, { status : message.status }, null, function(err, result) {
        if (err) {
            console.log( 'Failed message status update: ' + err );
            callback( 'ERROR', { message: 'Failed session update' } );
        } else {
            console.log( 'Successful update' );
            callback( null, result );
        }
    });
}

exports.deleteMessage = function(messageID,callback){
    console.log( 'delete message in MongoDB');
    console.log(messageID);
    var conditions = { _id : messageID };
    Message.findOneAndRemove(conditions, function(err, result) {
        if (err) {
            console.log( 'Failed remove message : ' + err );
            callback( 'ERROR', { message: 'Failed remove message' } );
        } else {
            console.log( 'Successful remove message' );
            callback( null, result );
        }
    });
}


exports.getMessagesNoRead = function(phoneID, callback) {
    console.log( 'Getting NOREAD messages  : ' + phoneID);
    Message.find({ 'phoneID': phoneID , 'status' :'NOTREAD' }, ' title type message status additionalInfo date', function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs){
          callback(null, msgs);
      }
      else{
          console.log("messages not found");
          callback("messages not found", null);
      }
  });
};

exports.getMessageByOrderID = function(orderID, callback) {
    console.log( 'Getting message : ' + orderID);

    var conditions = {'orderID': orderID };

    Message.findOne(conditions, 'title type message status additionalInfo date orderID', {sort: {date: -1}}, function (err, msg) {
      if (err) callback('ERROR', err);
      else
        callback(null, msg);
    });
};

exports.updateMessageByOrderID = function(payload,callback){
  delete payload._id
  var conditions = {orderID: payload.orderID};
  Message.update(conditions, payload, null, function(err, result) {
    if
      (err) callback('ERROR', err);
    else
      callback(null, result);
  });
};

function compare(a,b) {
    var keyA = new Date(a.date),
    keyB = new Date(b.date);
    // Compare the 2 dates
    if(keyA > keyB) return -1;
    if(keyA < keyB) return 1;
    return 0;
};
