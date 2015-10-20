/**
 * Created by nemux on 15/10/15.
 */

var ticketFlow = require('./flows/ticket-flow');

exports.buy = function(req, res){

    payload = {};
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid  = req.headers['x-auth-token'];
    payload.amount = req.amount;

    console.log('POST method buyTickets ');
    console.log(req.body);

    ticketFlow.buyTickets(req.body,phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(response);
            return;
        } else {
            var response = { statusCode:0 ,  additionalInfo : result };
            res.json(response);
        }
    });
};
