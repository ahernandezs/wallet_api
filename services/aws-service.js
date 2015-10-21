AWS = require('aws-sdk'); 
AWS.config.loadFromPath('config.json');

var s3 = new AWS.S3(); 

var fs = require('fs');
var bucket_name = 'amdocs-images'; // AwsSum also has the API for this if you need to create the buckets

exports.uploadImage2S3 = function(req,callback){
    var base64Str = req.content;
    var imageName = req.name;
    var rePattern = new  RegExp(/^data:image\/\w+;base64/);
    var contentType = base64Str.match(rePattern);
    contentType = contentType[0].replace(/^data:/,'').replace(/;base64/,'');
    console.log(contentType);
    var bodyStream = new Buffer(base64Str.replace(/^data:image\/\w+;base64,/, ''),'base64');
    var params = {
        Bucket    : bucket_name,
	    ACL: 'public-read',
        Key: 'profile/'+ imageName,
        ContentType :  contentType ,
        Body          : bodyStream
    };
    s3.putObject(params, function(err, data) {
        if(err) { 
            console.log('Error :' + err);
            callback(null,{ statusCode:1 ,  additionalInfo : err });
        }
        if(data){
            console.log(data);
            callback(null,{ statusCode:0 ,  additionalInfo : 'uploaded image' });
        }
    });
}


