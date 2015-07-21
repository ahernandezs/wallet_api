var updateOrder = require('../routes/flows/updateOrder-flow');
var umarketService = require('../services/umarketFacade-service');
var balance = require('../routes/flows/balance-flow');
var eventQuery = require('../model/queries/event-query');
var transacctionQuery = require('../../model/queries/transacction-query');
var async = require('async');
var moment = require('moment-timezone');

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

    async.waterfall([
        function (callback){
            console.log('POST method buyTickets ');
            console.log(req.body);
            var phoneID = req.headers['x-phoneid'];
            var sessionID = req.headers['x-auth-token'];
            umarketService.buyTickets(req.body,phoneID,function(err,result){
                if(err){
                    var response = { statusCode:1 , additionalInfo : JSON.stringify(err)};
                    callback(err,response, phoneID);
                }else{
                    var response = { statusCode:0 ,  additionalInfo : result };
                    callback(null, response, phoneID)
                }
            });
        },
        function(response, phoneID, callback){
            logger.info( 'Create  transacction ticket' );
            var dateTime = moment().tz(process.env.TZ).format().replace(/T/, ' ').replace(/\..+/, '').substring(0,19);
            var transacction = {};
            transacction.title = 'Buy ticket';
            transacction.type = 'MONEY',
            transacction.date = dateTime;
            transacction.amount = (-1);
            transacction.operation = 'BUY_TICKET';
            transacction.phoneID = phoneID;
            transacctionQuery.createTranssaction(transacction, function(err, result) {
                if (err) {
                    logger.error('Error to create transacction');
                    callback(err,response);
                }
                else{
                    logger.info(result);
                    callback(null,response);
                }
            });
        }
        ], function (err, response) {
            if(err)
                console.log('Error WATERFALL Vimpelcom.buyTickets  --->' + JSON.stringify(result));
            res.json(response);
        }
    );
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
