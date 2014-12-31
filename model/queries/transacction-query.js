var async = require('async');
var transacction = require('../transacction');
var user = require('../user');
var config = require('../../config.js');


exports.getTransacctions = function(phoneIDToSearch, callback) {
    console.log( 'Get Transacctions' );
    transacction.find({phoneID:phoneIDToSearch, type:'MONEY'}, 'title description amount date',{sort: {date: -1}}, function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            console.log('Empty');
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            console.log('Return Collection');
            response = { statusCode: 0, additionalInfo: transacction };
            callback(null, transacction);
        }
    });
};

exports.getTransacctionsDox = function(phoneIDToSearch, callback) {
    console.log( 'Get Transacctions DOX' );
    transacction.find({phoneID:phoneIDToSearch, type:'DOX'}, 'title description amount date',{sort: {date: -1}}, function(err, transacction)  {
        var response;
        if (err) {
            response = { statusCode: 1, additionalInfo: err };
            console.log(err.message);
            callback("ERROR: " + err.message, response);
        } else if (transacction.length === 0) {
            response = { statusCode: 0, additionalInfo: 'Empty' };
            console.log(response);
            callback(null, response);
        } else {
            callback(null, transacction);
        }
    });
};

exports.createTranssaction = function(data, callback) {
    console.log('Save transacction');
    var newTransacction = new transacction(data);
    var result = newTransacction.save(function(err) {
        if (err) return 1;
        return 0;
    });
    if (result === 1)
        callback('ERROR', 'The transacction could not be created');
    else
        callback(null, 'The Transacction was created successfully');
};

exports.getTransacctionsSocialFeed = function(callback) {
    console.log( 'Get Transacctions' );
    //compras
    //regalos 
    //transferencias
    async.waterfall([

        function(callback){

            var o = {};
            var map = function () { 
                var output = {title:this.title, 
                              description:this.description,
                              amount:this.amount, 
                              date:this.date,
                              operation:this.operation, 
                              type:this.date,
                              phoneID:this.phoneID ,
                              name:null
                }
                  emit(this.phoneID,output); 
            }

            var mapUser = function(){
                var output ={ title:null, 
                              description:null,
                              amount:null, 
                              date:null,
                              operation:null, 
                              type:null,
                              phoneID:this.phoneID,
                              avatar:null,
                              name:this.name,
                }
                emit(this.phoneID,output);
            }

            var reduce = function (k, values) {
                var outs={ title:null , description:null , amount:null, operation:null, type:null ,name:null, avatar:null };
                
                values.forEach(function(v){
                   if(outs.title == null) outs.title = v.title;
                   if(outs.description == null) outs.description = v.description;
                   if(outs.amount == null) outs.amount = v.amount;
                   if(outs.operation == null) outs.operation = v.operation;
                   if(outs.type == null) outs.type = v.type;
                   if(outs.phoneID == null) { 
                    outs.phoneID = v.phoneID;
                    outs.avatar = 'http' + v.phoneID;
                    }
                   if(outs.name == null) outs.name = v.name;
                });
                return outs;
            }
            o.query = 
            //, name : user.findOne({phoneID:this.phoneID}).name };
            o.verbose = true; // default is false, provide stats on the job


            // a promise is returned so you may instead write
            transacction.mapReduce({
                map: map,
                reduce: reduce , 
                query : { operation:'TRANSFER' },
                limit: 10,
                out : {reduce : "Talent_Testimonials"} ,
                //out : { reduce : "Talent_Testimonials"}
            }, function (err, results, stats) {
              console.log("map reduce took %d ms", stats);
              console.log(results);
               user.mapReduce({
                map: mapUser,
                reduce: reduce ,
                out : {reduce : "Talent_Testimonials"}
                //query : { 'phoneID': this.phoneID }
                }, function (err, results, stats) {
                    console.log(results);
                    callback(null,results);
                });
            });

            

           /* var conditionsBuys = { 'operation':config.messages.type.BUY };
            var buys = transacction.find(conditionsBuys, 'title description amount date operation type phoneID');
            buys.sort({date: -1});
            buys.limit(10);
            buys.exec(function (err1, buyTransactions) {
                callback(null,buyTransactions);
            });*/
        },

        function(buyTransactions, callback){
            var conditionsTransfers = { 'operation':config.messages.type.TRANSFER }
            var transfers = transacction.find(conditionsTransfers, 'title description amount date operation type');
            transfers.sort({date: -1});
            transfers.limit(10);
            transfers.exec(function (err1, transferTransactions) {
                callback(null, buyTransactions, transferTransactions);
            });
        },
        
        function(buyTransactions, transferTransactions, callback){
            var conditionsGifts = { 'operation':config.messages.type.GIFT };
            var gifts = transacction.find(conditionsGifts, 'title description amount date operation type');
            gifts.sort({date: -1});
            gifts.limit(10);
            gifts.exec(function (err1, giftsTransactions) {
                callback(null,buyTransactions, transferTransactions,giftsTransactions);
            });
        },

        function(buyTransactions, transferTransactions,giftsTransactions, callback){
            var resulTransactions = buyTransactions.concat(transferTransactions);
            resulTransactions = resulTransactions.concat(giftsTransactions)
            resulTransactions.sort(compare);
            response = { statusCode: 0, additionalInfo: resulTransactions }
            callback(null, response);
        }

        ], function (err, result){
            callback(null,result);
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
