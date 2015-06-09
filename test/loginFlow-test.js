var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var should = require('should');


describe('When user do login ....', function(){

	console.log('Execute test for login');
	var url ='http://localhost:3000';

	before(function(done) {
	});

	describe('Login user',function(){
		it('should return error trying to save duplicate username', function(done) {
			this.timeout(15000);
			var requestPayload = {
				"phoneID": "39ED29755F684FC091AP",
				"pin" :"1234" ,
				"group" : "INTERNAL"
			};

			request(url)
			.post('/api/login')
			.send(requestPayload)
		// end handles the response
		.end(function(err, res) {
			if (err) {
				console.log(err);
				throw err;
			}
			// this is should.js syntax, very clear
			console.log('Response from login');
			res.body.should.have.property('statusCode');
			res.body.should.have.property('additionalInfo');
			res.body.statusCode.should.equal(0);
			//res.should.be.equal(200);
			done();
			setTimeout(done, 15000);
			});
		});
	});
});
