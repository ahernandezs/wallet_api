/**
 * Created by nemux on 19/11/15.
 */

var user = require('../model/user');
var transfer = require('./flows/transfer-flow');
var merchantQuery = require('../model/queries/merchant-query');
var config = require('../config.js');
var logger = config.logger;

exports.dox_reset = function dox_reset_all(req, res){
    var phoneId = req.params.phoneId;
    var query = (phoneId === 'all')
                ? {}
                : {phoneID: phoneId.toString() };

    console.log(query);
    console.log('PhoneId to Reset Dox ->' + query);

    merchantQuery.getMerchantByID(1, function(err,result){
        if (err) {
            console.log('ERROR IN GET MERCHANT');
            callback('ERROR', {message: 'Fail  getLeaderboard'});
        } else {
            user.find(query, 'phoneID name doxs pin', {sort: {doxs: -1}},function (err, people) {
                console.log('------------------------------------');
                if (err) {
                    console.log('ERRROOOOOOOOOOOOOOOOOOOOOOORRRR');
                    return res.send({statusCode: 1, additionalInfo: 'Error Finding User'});
                }
                else if(people){
                    console.log('*****************TOTAL PEOPLE*****************-> ' + people.length);
                    var total = 1;
                    var resetUsers = [];

                    for(var i = 0; i < people.length; i++){
                        //For all users we do a transfer.
                        userInfo = {};
                        userInfo.amount = people[i].doxs;
                        userInfo.phoneID = people[i].phoneID;
                        userInfo.pin = people[i].pin;
                        console.log(userInfo);
                        transfer.resetDox(userInfo,function(err,infoDox){
                            if(err) {
                                console.log('-------FINISH SERVICE---------');
                                res.send(infoDox);
                                return;
                            }

                            console.log('TOTAL RESETEADOS -> ' + total );
                            console.log('PhoneId-> ' + userInfo.phoneID + ' DOX -> ' + infoDox);
                            resetUsers.push(userInfo.phoneID);

                            if (total == people.length){
                                console.log('-------FINISH SERVICE---------');
                                res.send({statusCode:0, additionalInfo:{total: total, users:[resetUsers]}});
                                return;
                            }
                            total++;
                        });
                    }
                } else {
                    console.log("User(s) not found");
                    res.send({statusCode:1, additionalInfo:"USER(S) NOT FOUND"});
                }
            });
        }
    });
};