var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var enviromentSchema =  new Schema({
	env: String ,
	url: String ,
});

module.exports = mongoose.model('Enviroment', enviromentSchema);  
