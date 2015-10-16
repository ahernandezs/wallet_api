/**
 * Created by nemux on 15/10/15.
 */

var ticketFlow = require('./flows/ticket-flow');

exports.buy = function(req, res){
    console.log('POST method buyTickets ');
    console.log(req.body);
    var phoneID = req.headers['x-phoneid'];
    var sessionID = req.headers['x-auth-token'];

    ticketFlow.buyTickets(req.body,phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(response);
        }else{
            var response = { statusCode:0 ,  additionalInfo : result };
            res.json(response);
        }
    });
};
