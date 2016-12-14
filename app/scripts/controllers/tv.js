'use strict';

angular.module('pantallasAdministradorApp')
.controller('tvCtrl', ['$scope', '$rootScope', '$location', '$http', '$interval', 'ngAudio', function ($scope, $rootScope, $location, $http, $interval, ngAudio) {

	$scope.lista = new Array();
	$scope.lista.push({'name':'', 'orderNumber': 'NO ORDERS', 'photo': '/images/persona.png'});

	var socket = io.connect('http://amdocswalletapidemonode-muymevnpey.elasticbeanstalk.com');
	socket.on('connect',function(){
		socket.emit("adduser", Math.round(Math.random()*10000));
	});

	socket.on('update_tv', function(payload){
		$scope.lista.push(payload);
	});

	$interval(function(){
		if($scope.lista.length > 1){
			$scope.lista.shift();
		}
	},3000,0);
	$scope.audio = ngAudio.load('TVAuth_Tone.wav');
	$scope.audio.loop = true;
	$scope.audio.play();
}]);
