var assert = require('assert');
var should = require('should');
var request = require('supertest');  
var mongoose = require('mongoose');

describe('When user do login ....', function(){
	before(function(done) {
		mongoose.connect('mongodb://localhost/amdocs');
		done();
	});
	var url ='http://localhost:3000';

	describe('Register User',function(){
		 it('should return json with information about user', function(done) {

		 done();
		 });
	});

	 describe('Login user',function(){
	 it('should return json with information about user', function(done) {
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
		            throw err;
		          }
				res.body.should.have.property('statusCode');
				res.body.statusCode.should.be.type('number');
				res.body.should.have.property('additionalInfo');
				res.body.statusCode.should.equal(0);
				res.body.additionalInfo.should.have.property('current');
				res.body.additionalInfo.should.have.property('dox');
				res.body.additionalInfo.should.have.property('unreadMsgs');
				//res.should.be.equal(200);
				res.body.should.have.property('userInfo');
				res.body.userInfo.should.have.property('email');
				res.body.userInfo.should.have.property('company');
				res.body.userInfo.should.have.property('name');
				res.body.userInfo.should.have.property('profileCompleted');
				done();
				setTimeout(done, 15000);

			});
		});
	});
});
