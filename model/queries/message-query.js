var Message = require('../message');

exports.createMessage = function(message, callback) {
    console.log( 'Persistmessage : ' + JSON.stringify(message));
      var messageToPersist = new Message(message);
      console.log('Message to persist user' + JSON.stringify(messageToPersist));
      messageToPersist.save(function (err) {
        if (err) callback("ERROR", { statusCode: 1,  additionalInfo: 'Error to persist user' });
        callback(null, { statusCode: 0 ,  additionalInfo: 'Message persisted correctly' }); ;
    });
};

exports.getMessagesNoRead = function(phoneID, callback) {
    console.log( 'Getting NOREAD messages  : ' + phoneID);
    Message.find({ 'phoneID': phoneID }, ' title type message status', function (err, msgs) {
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
