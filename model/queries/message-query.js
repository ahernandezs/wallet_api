var Message = require('../message');

exports.createMessage = function(message, callback) {
    console.log( 'Persistmessage ');
      var messageToPersist = new Message(message);
      messageToPersist.save(function (err) {
        if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to persist user' });
        callback(null, { statusCode: 0 ,  additionalInfo: 'Message persisted correctly' }); ;
    });
};

exports.getMessages = function(phoneID, callback) {
    console.log( 'Getting NOREAD messages  : ' + phoneID);
    Message.find({ 'phoneID': phoneID }, ' title type message status additionalInfo date',{sort: {date: -1}}, function (err, msgs) {
        if (err) callback('ERROR', err);
        else if(msgs){
          console.log(msgs);
          callback(null, msgs);
      }
      else{
          console.log("messages not found");
          callback("messages not found", null);
      }
  });
};

exports.updateMessage = function(message,callback){
    console.log( 'Updating status message in MongoDB');
    console.log(message);
    var conditions = { _id : message._id };
    Message.update( conditions, { status : message.status}, null, function(err, result) {
        if (err) {
            console.log( 'Failed message status update: ' + err );
            callback( 'ERROR', { message: 'Failed session update' } );
        } else {
            console.log( 'Successful update' );
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
