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

    var mensajes = {};
    var tmp = {};
    var condiciones = {$and: [  {'status': config.messages.status.NOTREAD },
                                {'phoneID': phoneID }]}

    Message.find(condiciones, ' title type message status additionalInfo date', {sort: {date: -1}}, function (err, msgs) {

      if (err) callback('ERROR', err);
      else if(msgs){
        mensajes = msgs;
        tmp = msgs;
      }

      var conditions =  {$and: [ {'status': config.messages.status.READ},
                                 {'phoneID': phoneID }]};

      var  msj = Message.find(conditions, 'title type message status additionalInfo date', {sort: {date: -1}});
      msj.limit(10);
      msj.exec(function (err1, losMensajes) {

        if (err1) callback('ERROR', err);
        else if(losMensajes)

          tmp = mensajes.concat(losMensajes);

        callback(null, tmp);

      });
    });
};

exports.updateMessage = function(message,callback){
    console.log( 'Updating status message in MongoDB');
    console.log(message);
    var conditions = { _id : message._id };
    var dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    Message.update( conditions, { status : message.status, date : dateTime }, null, function(err, result) {
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
