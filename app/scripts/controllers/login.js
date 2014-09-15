'use strict';

angular.module('pantallasAdministradorApp')
  .controller('LoginCtrl', function ($scope, $log, $location) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.login=function(username,password){
	 		console.log("hola");
	 		$scope.username="";
	 		$scope.password="";
	 		//if(username=='alex@hotmail.com' && password==123){
	 		$scope.isAuthenticated = true;
	 		$location.path('/mainAccount');
	 		//};
	 };
  });
