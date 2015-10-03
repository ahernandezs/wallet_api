/**
 * Created by nemux on 2/10/15.
 */

exports.generate = function(low,  high, callback){

    var random = Math.floor(Math.random() * (high - low + 1) + low);
    callback(random);
}