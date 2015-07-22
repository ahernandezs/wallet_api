// Convert from JSON to String
exports.JSONtoString = function (json) {
    var obj = json;
    var str = 'statusCode: ' + obj.statusCode;
    var val = ', ';
    for(var i = 0; i < obj.additionalInfo.length; i++)
        val += obj.additionalInfo[i];
    return str + val.replace(/\n|\r/g, '');
};