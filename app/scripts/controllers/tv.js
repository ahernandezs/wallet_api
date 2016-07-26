'use strict';

angular.module('pantallasAdministradorApp')
.controller('tvCtrl', ['$scope', '$rootScope', '$location', '$http', '$interval', function ($scope, $rootScope, $location, $http, $interval) {

	$scope.lista = new Array();
	$scope.lista.push({'name':'Jonathan', 'orderNumber': '3231231', 'photo': '/images/persona.png'});

	var socket = io.connect('http://localhost');
	socket.on('update_tv', function(payload){
		lista.push(payload);
	});

	/*$interval(function(){
		//simula una llamada cada 10 seg.
		var payload = {'name':'Jonathan', 'orderNumber': Math.round(Math.random()*100000), 'photo': '/images/persona.png'};
		$scope.lista.push(payload);
	},1000,10);*/

	$interval(function(){
		if($scope.lista.length > 1){
			$scope.lista.shift();
		}
	},3000,0);

}]);
