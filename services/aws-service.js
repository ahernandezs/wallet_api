AWS = require('aws-sdk'); 
AWS.config.loadFromPath('config.json');
var async = require('async');
var s3 = new AWS.S3(); 

var fs = require('fs');
var bucket_name = 'amdocs-images'; // AwsSum also has the API for this if you need to create the buckets

exports.uploadImage2S3 = function(req,callback){
    var base64Str = req.content;
    var imageName = req.name;
    var rePattern = new  RegExp(/^data:image\/\w+;base64/);
    var contentType = base64Str.match(rePattern);
    contentType = contentType[0].replace(/^data:/,'').replace(/;base64/,'');
    var bodyStream = new Buffer(base64Str.replace(/^data:image\/\w+;base64,/, ''),'base64');


    async.waterfall([
    function(callback) {
        console.log('Delete  object from S3 ');
        var params = {
            Bucket    : bucket_name,
            Key: 'profile/'+ imageName,
        };
        s3.deleteObject(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else  {
            console.log('Delete successful');
          }   console.log(data);           // successful response
        });
        callback(null);
    },
    function(callback) {
        console.log('Upload Image ');
        var params = {
            Bucket    : bucket_name,
            ACL: 'public-read',
            Key: 'profile/'+ imageName,
            ContentType :  contentType ,
            Body          : bodyStream
        };
        s3.upload(params, function(err, data) {
            if(err) { 
                console.log('Error :' + err);
                callback(null,{ statusCode:1 ,  additionalInfo : err });
            }
            if(data){
                callback(null,{ statusCode:0 ,  additionalInfo : 'uploaded image' });
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

}


