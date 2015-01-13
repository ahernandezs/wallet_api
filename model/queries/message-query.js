var mailService = require('../../services/sendGrid-service');
var Message = require('../message');
var config = require('../../config.js');

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

    var tmp = {};
    var condiciones = {$and: [  {'phoneID': phoneID } ] };

    Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {

      if (err) callback('ERROR', err);
      else if(msgs){
        tmp = msgs;
      }
        callback(null, tmp);
    });
};

exports.updateMessage = function(message,callback){
    console.log( 'Updating status message in MongoDB');
    console.log(message);
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
