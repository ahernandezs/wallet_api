var updateOrder = require('../routes/flows/updateOrder-flow');
var umarketService = require('../services/umarketFacade-service');
var balance = require('../routes/flows/balance-flow');
var eventQuery = require('../model/queries/event-query');

exports.microLending = function(req, res) {
    console.log('POST method microLending ');
    console.log(req.body);
    var phoneID = req.headers['x-phoneid'];
    var sessionID = req.headers['x-auth-token'];
    umarketService.loanDisburse(req.body,phoneID,function(err,result){
    	if(err){
    		var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
    		res.json(response);
    	}else{
            var response = { statusCode:0 ,  additionalInfo : result };
            balance.balanceFlow(sessionID, function(err,balance){
                res.json(response);
            });
    	}
    });
};


exports.buyTickets = function(req, res) {
    console.log('POST method buyTickets ');
    console.log(req.body);
    var phoneID = req.headers['x-phoneid'];
    var sessionID = req.headers['x-auth-token'];
    umarketService.buyTickets(req.body,phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(response);
        }else{
            var response = { statusCode:0 ,  additionalInfo : result };
            res.json(response);
        }
    });
};

exports.paymentInsurance = function(req, res) {
    console.log('POST method payment Insurance ');
    console.log(req.body);
    var phoneID = req.headers['x-phoneid'];
    var sessionID = req.headers['x-auth-token'];
    umarketService.paymentInsurance(req.body,phoneID,function(err,result){
        if(err){
            var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(response);
        }else{
            var response = { statusCode:0 ,  additionalInfo : result };
            res.json(response);
        }
    });
};

exports.catalogEvents = function(req,res) {
    console.log('GET method catalogEvents ');
    eventQuery.getEvents(function(err,result){
        if(err){
            var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
            res.json(response);
        }else{
            var response = { statusCode:0 ,  additionalInfo : result };
            res.json(response);
        }
    });

}
