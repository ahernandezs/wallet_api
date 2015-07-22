var rest = require('restler');
var async = require('async');
var url_base = process.env.REST_URL_CITI;

/**
  Start login process and return  challenge for 2FA
  @Version 1.1
**/
exports.payment =  function(amount,callback){
    async.waterfall([
        function(callback) {
          console.log('execute operation login ');
          rest.post('https://Citibankapi.ciondemand.com:443/citi/prod/retailbanking/v1/login?client_id=50c698cb-1d2f-4b64-a563-0b25866b0835',
             {
              data: JSON.stringify ( { 
                                      username : 'impatiencesnuffle', 
                                      password: 'mooBi8jais', 
                                    }) 
                }).on('complete', function(data, response) {
                if(data){
                  if(data.httpCode){
                    var responseError = {statusCode:1, additionalInfo:data};;
                    callback('ERROR',responseError);
                  }else{
                    console.log(data);
                    callback(null,data);
                  }
                }else{
                  var responseError = {statusCode:1, additionalInfo:data};;
                  callback('ERROR',responseError);
                }
            });
        },
        function(payloadSession, callback) {
          console.log('execute operation transfers fund ');
          var date = new Date();
          var dateFormat = null;
          var year = date.getFullYear();

          if(date.getDay() < 10)
            var day = '0'+date.getDay();

          if(date.getMonth() <10)
            var month = '0'+date.getMonth();

          dateFormat = day+'-'+month+'-'+year
          console.log(dateFormat);
          rest.post('https://citibankapi.ciondemand.com/citi/prod/retailbanking/v1/accounts/60e6874a-3c6d-4093-b5f1-0878fab6b87c/fund_transfers?client_id=50c698cb-1d2f-4b64-a563-0b25866b0835',
             {
              data: JSON.stringify ( {amount : amount, 
                                      transaction_date : '04-13-2015', 
                                      payment_type : 'FXR', 
                                      currency: 'USD', 
                                      payee_id : '6d598c9b-1242-4370-b737-f30748dfa2c7', 
                                      memo: '' , payee_desc:'wallet operation', destination_id:"1", 
                                      payee_type: 1 }) ,
              headers: { 
                          Authorization : 'Bearer '+ payloadSession.token ,
                          'Content-Type'  : 'application/json'
                       } 
                }).on('complete', function(data, response) {
                if(data){
                  if(data.httpCode){
                    var responseError = {statusCode:1, additionalInfo:data};;
                    callback('ERROR',responseError);
                  }else{
                    console.log(data);
                    callback(null,data);
                  }
                }else{
                  var responseError = {statusCode:1, additionalInfo:data};;
                  callback('ERROR',responseError);
                }
            });
        }
    ], function (err, result) {
        if(err){      
            callback('ERROR',result);
        } else {      
            callback(null,result);
        }
    })
};


