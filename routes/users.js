var mongoose = require('mongoose');
var request = require('request');
var User = require('../model/user');
var LiveUserRepository = require('../model/liveUser');
var Order = require('../model/order');
var Userquery = require('../model/queries/user-query');
var anzenUser = require('./flows/register-flow');
var sessionUser = require('./flows/login-flow');
var forgotPin = require('./flows/forgotPin-flow');
var requestMoney = require('./flows/requestMoney-flow');
var messages = require('./flows/message-flow');
var buyFlow = require('./flows/buy-flow');
var topup = require('./flows/topup-flow');
var awsS3 = require('../services/aws-service');
var sms = require('../services/sms-service');
var urbanService = require('../services/notification-service');
var random = require('../utils/random');
var smsverificationRepository = require('../model/sms_verification');
var smsverificationQuery = require('../model/queries/sms-query');
var config = require('../config.js');
var logger = config.logger;
var soap = require('soap');
var soapurl = process.env.SOAP_URL;

exports.login =  function(req, res, callback){
  console.log('execute POST method login');
  sessionUser.loginFlow(req.body,function(err,result){
      var token = result.sessionid;
      result.countryID = 'AP';
      result.currency = config.currency;
      result.additionalInfo.findAroundMe = process.env.FINDAROUNDME ? true : false;
      console.log('Token '+ token);
      if(result.statusCode === 0){
        res.setHeader('X-AUTH-TOKEN', result.sessionid);
        delete result.sessionid;
      }
      if (req.body.continue === undefined)
          res.json(result);
      else {
          result.token = token;
          callback(result);
      }
  });
};

exports.createsession = function(req, res) {
  console.log('execute GET method createsession');
  soap.createClient(soapurl, function(err, client) {
    client.createsession({}, function(err, result) {
      if(err) {
        res.send(500);
      } else {
        console.log(result);
        var response = result.createsessionReturn;
        res.json(response);
      }
    });
  });
};

exports.logout = function(req, res){
  var logoutResponse = {
  };
  var responseString = JSON.stringify(user);
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': userString.length
  };
  res.send(responseString);
};

exports.preregister = function(req, res){
    console.log('execute POST method preregister');
    console.log(req.body);


    //var phoneNumber = req.body.phoneNumber;
    var phoneNumber = req.body.phoneNumber;
    var countryCode = req.body.countryCode;

    if (!phoneNumber) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

    var enable_sms = process.env.SMS_ENABLED == "YES" ? true : false;

    sms_verification_data = {};
    sms_verification_data.phoneId = phoneNumber;
    sms_verification_data.phoneNumber = phoneNumber;
    sms_verification_data.createdAt = new Date();

    smsverificationQuery.set_code(phoneNumber,function(err, doc){
        if (err) {
            //res.status(503).send({code : 104, message : 'UNAVAILABLE DATABASE SERVICE' });
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }

        if (true){
            random.generate(11111,99999, function(number){
                if (doc) doc.verificationCode = number;
                else sms_verification_data.verificationCode = number;
                var message = "Hello! your verification code is: " + number + " at " + new Date();
                sms.sendMessage(countryCode + phoneNumber,message, function(err,sms_response){
                    if (err) {
                        //res.status(503).send({code : 103, message : 'UNAVAILABLE SMS SERVICE' });
                        res.send({statusCode: 3, additionalInfo: {message: 'UNAVAILABLE SMS SERVICE'}});
                        console.log(sms_response);
                        return;
                    }
                    if (doc){
                        doc.save(function(err){
                            if (err)
                                //res.status(503).send({code : 102, message : 'UNAVAILABLE DATABASE SERVICE' });
                                res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                            else
                                //res.status(200).send({code : 0, message : 'OK' });
                                res.send({statusCode: 0, additionalInfo: {message: 'OK'}});
                        });
                    } else {
                        var user_sms = new smsverificationRepository(sms_verification_data);
                        user_sms.save(function (err) {
                            if (err)
                                //res.status(503).send({code : 102, message : 'UNAVAILABLE DATABASE SERVICE' });
                                res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                            else
                                //res.status(200).send({code : 0, message : 'OK' });
                                res.send({statusCode: 0, additionalInfo: {message: 'OK'}});
                        });
                    }
                });
            });
        } else {
            if (doc) doc.verificationCode = 11111;
            else sms_verification_data.verificationCode = 11111;

            if (doc){
                doc.save(function(err){
                    if (err)
                        //res.status(503).send({code : 102, message : 'UNAVAILABLE DATABASE SERVICE' });
                        res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else
                        //res.status(200).send({code : 0, message : 'OK' });
                        res.send({statusCode: 0, additionalInfo: {message: 'OK'}});
                });
            } else {
                var user_sms = new smsverificationRepository(sms_verification_data);
                user_sms.save(function (err) {
                    if (err)
                        //res.status(503).send({code : 102, message : 'UNAVAILABLE DATABASE SERVICE' });
                        res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                    else
                        //res.status(200).send({code : 0, message : 'OK' });
                        res.send({statusCode: 0, additionalInfo: {message: 'OK'}});
                });
            }
        }
    });
};

exports.register = function(req, res){
  console.log('execute POST method register');
  console.log(req.body);

    if( !req.body.pin && !req.body.name &&
        !req.body.company && !req.body.email_address && !req.body.phoneID &&
        !req.body.appID && !req.body.OS && !req.body.answer) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }

  anzenUser.registerFlow(req.body, function(err,result){
    if(result.statusCode === 0){
      res.setHeader('X-AUTH-TOKEN', result.sessionid);
      delete result.sessionid;
      result.currency = config.currency;
    }
    //res.send({'dox':result.additionalInfo.dox, 'current':result.additionalInfo.current});
    result.additionalInfo.findAroundMe = process.env.FINDAROUNDME ? true : false;
    res.json(result);
  });
};

exports.updateProfile = function(req, res){
  console.log('execute POST method updateProfile' + JSON.stringify(req.body));
  req.body.sessionid = req.headers['x-auth-token'];
  Userquery.updateUser(req.body, function(err,result){
    res.json(result);
  });
};

exports.authorize = function(req, res){
  console.log('execute POST method authorize');
  console.log(req.body);
  var request = {authoriseRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.authorise(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);
        var response = result.authoriseReturn;
        res.json(response);
      }
    });
  });
};

exports.orders = function(req, res) {
  console.log('execute GET method orders');
};

exports.orderDetail = function(req, res) {
  console.log('execute GET method orders')
};

exports.resetPin = function(req, res){
  console.log('execute POST method resetPin');
  console.log(req.body);
  var request = { resetPinRequestType : req.body } ;
  //var request = {resetPinRequest: requestType };
  console.log(request);
  soap.createClient(soapurl, function(err, client) {
    client.resetPin(request, function(err, result) {
      if(err) {
        console.log(err);
        res.send(500);
      } else {
        console.log(result);
        var response = result.resetPinReturn;
        res.json(response);
      }
    });
  });
};

exports.validate = function(req, res){
  console.log('execute POST method validate');
  console.log(req.body);
  console.log('Search phoneID');
  req.body.phoneID = req.body.phoneID +'AP';
  console.log(req.body.phoneID);
  Userquery.validateUser(req.body.phoneID, function(err,result){
    var resultWithID = JSON.parse(JSON.stringify(result));
    resultWithID.countryID = 'AP';
    resultWithID.currency = config.currency;
    resultWithID.question = config.question;
    res.json(resultWithID);
  });
};

exports.verify_customer = function (req, res){
    var phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) {
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
        return;
    }
    Userquery.validateUserByMerchant(phoneNumber, function(err, userValidated) {
        if (err) {
            res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
            return;
        }
        if (!userValidated)
            res.send({statusCode: 6, additionalInfo: {message: 'CANNOT FOUND PHONEID'}});
        else {
            var payload = {};
            payload.phoneID = phoneNumber;
            payload.message = "Phone Validated. Receive a " + config.currency.symbol + config.merchantValidationAmount + " Topup!";
            payload.amount = config.merchantValidationAmount;

            console.log(payload);
            topup.verify_customer(payload, function(err, result){
                if (err){
                    res.send({statusCode: 1, additionalInfo : result});
                    return;
                }
                res.send({statusCode: 0, additionalInfo : { message : 'OK' }});
            });

        }
    });
};

exports.verify = function(req, res){
    console.log('Execute POST method verify');
    console.log(req.body);

    var phoneNumber = req.body.phoneNumber;
    var code = req.body.code;

    if (!phoneNumber && !code)
        //res.status(400).send({message: 'The request JSON was invalid or cannot be served. '});
        res.send({'statusCode' : 1, additionalInfo: {'message': 'INVALID JSON'}});
    else
        smsverificationQuery.verify_code(phoneNumber, code, function (err, result) {
            if (err) {
                //res.status(503).send({code: 202, message: 'UNAVAILABLE DATABASE SERVICE'});
                res.send({statusCode: 4, additionalInfo: {message: 'UNAVAILABLE DATABASE SERVICE'}});
                return;
            }
            if (result)
                Userquery.validateUser(phoneNumber, function(err,result) {
                    if (result.statusCode === 0)
                        //res.status(500).send({code: 104, message: 'PHONEID ALREADY REGISTERED'});
                        res.send({statusCode: 2, additionalInfo : { message : 'PHONEID ALREADY REGISTERED' }});
                    else
                        //res.status(200).send({code: 0, message: 'OK'});
                        res.send({statusCode: 0, additionalInfo : { message : 'OK' }});
                });
            else
                //res.status(500).send({code: 102, message: 'PHONEID WILL NOT REGISTER'});
                res.send({statusCode: 5, additionalInfo : { message : 'WRONG CODE' }});
        });
};


exports.validateAnswer = function(req, res){
  console.log('execute POST method validate Answer for secret question');
  var phoneID = req.headers['x-phoneid'];
  console.log('phoneID ' + phoneID);
  var answer = req.body.answer;
  console.log('answer ' + answer);
  Userquery.validateAnswer(phoneID,answer,function(err,result){
    var resultWithID = JSON.parse(JSON.stringify(result));
    res.json(resultWithID);
  });
}

exports.validateBuy = function(req, res){
  console.log('execute POST method validate Buy for OFFLA');
  var phoneID = req.headers['x-phoneid'];
  console.log('phoneID ' + phoneID);
  var payload = req.body;
  console.log('payload ' + JSON.stringify(payload));
  buyFlow.notifyMerchantBuy(phoneID,payload,function(err,result){
    var resultWithID = JSON.parse(JSON.stringify(result));
    res.json(resultWithID);
  });
}

exports.authorizeBuy = function(req, res){
  console.log('execute POST method authorize for OFFLA');
  var payload = req.body;
  console.log('payload ' + JSON.stringify(payload));
  buyFlow.authorizeBuy(payload,function(err,result){
    console.log(result);
    res.json(result);
  });
}

exports.putDoxs = function(req, res){
  Userquery.putDoxs(req.body, function(err,result){
    res.json(result);
  });
};

exports.getDoxs = function(req, res){
  Userquery.getDoxs(req.body.phoneID, function(err,result){
    res.json(result);
  });
};
exports.uploadImage = function(req,res){
  console.log('execute POST method uploadImage');
  awsS3.uploadImage2S3(req.body,function(err,result){
    res.json(result);
  });
};

exports.login2 =  function(req, res){
  console.log('execute POST method login');
  console.log(req.body);
  var request = {loginRequest: req.body};
  soap.createClient(soapurl, function(err, client) {
    client.login(request, function(err, result) {
        if(err) {
          console.log(err);
          res.send(500);
        } else {
          console.log(result);
          var response = result.loginReturn;
          res.json(response);
        }
    });
  });
};

exports.getUsers = function(req, res){
  console.log('Execute GET method get users');
  var request = {};
  request.sessionid = req.headers['x-auth-token'];
  request.phoneID = req.headers['x-phoneid'];
  Userquery.getUsers(request,function(err,result){
    var result = {url_base: config.S3.url , users: result};
    res.json(result);
  });
};

exports.regenerate = function(req, res, callback) {
    logger.info( 'POST method regenerate (session)' );
    var request = {};
    request.sessionid = req.headers['x-auth-token'];
    request.phoneID = req.headers['x-phoneid'];
    request.type = 1;
    sessionUser.regenerate(request, res, function(err, result) {
        if (err === 'ERROR') {
            logger.error(result);
            callback('ERROR', result);
        } else if (err !== 'STOP')
            callback(null, result);
        else
            callback(null, result);
    });
};

exports.getLeaderboard = function(req, res){
  var phoneID = req.headers['x-phoneid'];
  if(phoneID){
    Userquery.getLeaderboard(phoneID,function(err,result){
      var result = {url_base: process.env.AS3_IMAGES , users: result}
      res.json(result);
    });
  }else{
      Userquery.getLeaderboard(null,function(err,result){
      var result = {url_base:process.env.AS3_IMAGES , users: result}
      res.json(result);
    });
  }

}

exports.forgotPIN = function(req, res){
    console.log('Request forgotten PIN');
    var phoneID = req.headers['x-phoneid'];
    forgotPin.requestPinFlow(phoneID,function(err,result){
        console.log(result);
        if(err)
            res.json({ statusCode : 1, additionalInfo : result});
        else
            res.json({statusCode : 0, additionalInfo :  result});
    });
};

exports.inviteFriend = function(req, res){
  req.body.sessionid = req.headers['x-auth-token'];
  req.body.phoneID = req.headers['x-phoneid'];

  Userquery.inviteFriend(req.body, function(err, result){
    if(err) {
        console.log('Error: '+JSON.stringify(err));
        res.json( err);
    } else {
        console.log('Resultado: '+JSON.stringify(result));
        res.json(result);
    }
  });
};

exports.requestMoney = function(req, res){
  req.body.phoneID = req.headers['x-phoneid'];

    var enable_sms = process.env.SMS_ENABLED == "YES" ? true : false;

    if (req.body.destinatary == req.body.phoneID){
        res.send({statusCode: 13, additionalInfo: {message: 'SENDER AND RECEIVER ARE THE SAME.'}});
        return;
    }

    Userquery.findUserByPhoneID(req.body.destinatary, function(err,user){
        if(err) {
            //User not registered
            if (enable_sms){
                var message = "Hello! you have received a money request from " + req.body.phoneID;

                sms.sendMessage(req.body.destinatary,message, function(err,sms_response) {
                    if (err) {
                        //res.status(503).send({code : 103, message : 'UNAVAILABLE SMS SERVICE' });
                        res.send({statusCode: 3, additionalInfo: {message: 'UNAVAILABLE SMS SERVICE'}});
                        console.log(sms_response);
                        return;
                    }
                });
            } else {
                logger.info('SENDED REQUEST MONEY MESSAGE TO NOT REGISTERED USER');
            }
        }

        requestMoney.requestMoneyFlow(req.body, function (err, result) {
            console.log(result);
            if (err)
                res.json({statusCode: 1, additionalInfo: result});
            else
                res.json(result);
        });
    });
}

exports.sendMessage = function(req, res){
  req.body.sessionid = req.headers['x-auth-token'];
  req.body.phoneID = req.headers['x-phoneid'];

    if(req.body.message && req.body.message !=''){
      messages.sendMessage(req.body,function(err,result){
        console.log(result);
        if(err)
          res.json({ statusCode : 1, additionalInfo : result});
        else
          res.json(result);
      });
    }
    else
      res.json({ statusCode : 0, additionalInfo : 'messager was sent successfully'});

};

exports.resolveRquest = function(req, res) {
    req.headers.sessionid = req.headers['x-auth-token'];
    req.headers.phoneID = req.headers['x-phoneid'];
    req.body.phoneID = req.headers['x-phoneid'];
    
    requestMoney.resolveRequestFlow(req.body, req.headers, function(err, result) {
        console.log( result );
        if (err)
            res.json( { statusCode : 1, additionalInfo : result } );
        else if (req.body.answer === config.requests.status.ACCEPTED)
            res.json( result );
        else
            res.json( { statusCode : 0, additionalInfo : result } );
    });
};


exports.getSocialFeeds = function(req, res) {
    req.body.phoneID = req.headers['x-phoneid'];
    
    requestMoney.resolveRequestFlow(req.body, function(err, result) {
        console.log( result );
        if (err === 'ERROR')
            res.json( { statusCode : 1, additionalInfo : result } );
        else
            res.json( { statusCode : 0, additionalInfo : result } );
    });
};

exports.getSMSMessage = function(req, res) {
    req.body.phoneID = req.headers['x-phoneid'];

    if (req.body.phoneID)
        res.json( { message : config.sms.message } );
    else
        res.json( { statusCode : 1, additionalInfo : 'Error to get message' } );

};

exports.getContacts = function(req, res) {
  Userquery.getContactList(req.body.phones , function(err,result) {
    if (err)
      res.json( { statusCode : 1, additionalInfo : result } );
    else{
      res.json( {  url_base: process.env.AS3_IMAGES  , users :result });
    }
  });
};


exports.getPendingPayments = function(req, res) {
  console.log(req.body);
  Userquery.getContactList(req.body.phones , function(err,result) {
    if (err)
      res.json( { statusCode : 1, additionalInfo : result } );
    else{
      res.json( {  url_base: process.env.AS3_IMAGES , users :result });
    }
  });
};

exports.authorizeShopMobileBuy = function(req , res){
  logger.info(req.headers['x-auth-token']);
  var json = req.body;
  json['sessionid']= req.headers['x-auth-token'];
  console.log('Execute method authorizeShopMobileBuy');
  console.log(json);
   buyFlow.authorizeShopMobileBuy(json , function(err,result) {
    if (err === 'ERROR')
      res.json( { statusCode : 1, additionalInfo : result } );
    else
      res.json(result);
  }); 
}

exports.getUserByPhoneId = function(req, res){
    var phoneId = req.params.phoneId;
    var removeLive = req.query.remove_live;
    var imageProfile = process.env.AS3_IMAGES + phoneId + '.png';

    request(imageProfile, function (err, resp) {
        if (resp.statusCode !== 200)
            imageProfile = process.env.AS3_IMAGES + 'ico-default-tv.png';
        Userquery.findUserByPhoneID(phoneId, function (err, user) {
            if (err)
                return res.send(user);
            Order.find({customerName: user.name, $or: [{status: 'READY'}]}, { customerImage: 1, customerName: 1,
                date:1, orderId: 1, status: 1, total: 1, products: 1, _id: 0})
                .sort({orderId: -1})
                .limit(1)
                .exec(function (err, lastOrder) {
                    if (!(removeLive == 'true')) {
                        console.log("REMOVE FLAG NOT DEFINED!!!");

                        var additionalInfo = {
                            'phoneID': user.phoneID,
                            'email': user.email,
                            'name': user.name,
                            'company': user.company,
                            'balance': user.balance,
                            'doxs': user.doxs,
                            'profile': imageProfile,
                            'lastOrder': lastOrder.length > 0 ? lastOrder[0] : 'NO ORDERS',
                            'genre': user.genre
                        };

                        var liveUser = new LiveUserRepository(additionalInfo);

                        LiveUserRepository.findOneAndRemove({phoneID: additionalInfo.phoneID}, {}, function (err, doc, result) {

                            liveUser.save(function (err, lu) {
                                if (err) return res.send({statusCode: 1, additionalInfo: 'ERROR SAVING LIVEUSER'});

                                var response = {
                                    statusCode: 0,
                                    additionalInfo: {
                                        'phoneID': lu.phoneID,
                                        'email': lu.email,
                                        'name': lu.name,
                                        'company': lu.company,
                                        'balance': lu.balance,
                                        'doxs': lu.doxs,
                                        'profile': imageProfile,
                                        'lastOrder': lu.lastOrder,
                                        'lastVisit': lu.lastVisit
                                    }
                                };
                                return res.send(response);
                            });
                        });

                    } else {
                        console.log("REMOVE FLAG DEFINED!!!");

                        LiveUserRepository.findOneAndRemove({phoneID: user.phoneID}, {}, function (err, doc, result) {
                            if (err) {
                                console.log(err);
                                return res.send({statusCode: 1, additionalInfo: 'ERROR DELETING LIVEUSER'});
                            }

                            if (!doc)
                                return res.send({
                                    statusCode: 0,
                                    additionalInfo: {}
                                });
                            var response = {statusCode: 0};
                            response.additionalInfo = {
                                'phoneID': doc.phoneID,
                                'email': doc.email,
                                'name': doc.name,
                                'company': doc.company,
                                'balance': doc.balance,
                                'doxs': doc.doxs,
                                'lastVisit': doc.lastVisit,
                                'profile': imageProfile,
                                'lastOrder': doc.lastOrder
                            };
                            return res.send(response);
                        });
                    }
                });
        });
    });
}

exports.getLiveUsers = function(req, res){
    var phoneId = req.query.phoneId;

    if (phoneId){
        LiveUserRepository.findOne({phoneID: phoneId},{phoneID:1, email:1, name:1, company:1, balance:1, doxs:1, lastVisit: 1, profile:1, lastOrder: 1, _id:0},function(err, user){
            console.log(user);
            return res.send({statusCode:0, additionalInfo: user ? true : false});
        });

    } else {
        LiveUserRepository.find({},{phoneID:1, email:1, name:1, company:1, balance:1, doxs:1, lastVisit: 1, profile:1, lastOrder:1,  _id:0},{ sort: {doxs: -1,lastVisit:-1 }},function(err, users){
            console.log(users);
           return res.send({statusCode:0, additionalInfo: users});
        });
    }
};

exports.getCurrency = function(req, res){
    res.send(config.currency);
}