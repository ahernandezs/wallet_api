/**
 * Created by nemux on 15/10/15.
 */

var ticketFlow = require('./flows/ticket-flow');
var events = require('../model/event');
var config = require('../config');

exports.get_all = function(req, res){
    events.getAllEvents(function(err, events){
       if (err){
           res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
           return;
       }
        res.send(events);
    });
};

exports.get_by_id = function(req, res){
    var eventId = req.params.id;
    events.getEvent(eventId, function(err, event){
        if (err){
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }
        if (!event)
            res.send({statusCode: 8, additionalInfo : { message : 'CANNOT FOUND EVENTID' }});
        else
            res.send(event);
    });
};

exports.buy = function(req, res){

    var payload = {};
    payload.phoneID = req.headers['x-phoneid'];
    payload.sessionid  = req.headers['x-auth-token'];
    payload.eventId = req.body.eventId;
    payload.eventVenue = req.body.eventVenue;

    console.log('POST method buyTickets');
    console.log(req.body);

    events.getEvent(payload.eventId, function(err,event){
        var discount;
        var venueExist = false;

        if (err){
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }

        if (!event){
            res.send({statusCode: 8, additionalInfo : { message : 'CANNOT FOUND EVENTID' }});
            return;
        }

        for(var i = 0; i < event.prices.length; i++) {
            if (event.prices[i].type == payload.eventVenue) {
                payload.cost = event.prices[i].cost;
                venueExist = true;
            }
        }

        if (!venueExist){
            res.send({statusCode: 9, additionalInfo : { message : 'CANNOT FOUND VENUE' }});
            return;
        }

        discount = event.discount;
        payload.amount = payload.cost * ((100 - discount) / 100);
        payload.message = config.messages.ticketBuyMsg;

        ticketFlow.buy(payload,function(err,result){
            if(err){
                var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
                res.json(response);
                return;
            } else {
                var response = { statusCode:0 ,  additionalInfo : result };
                res.json(response);
            }
        });
    });
};
