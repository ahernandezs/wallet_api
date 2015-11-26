'use strict';

angular.module('pantallasAdministradorApp')
.controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$http',  function ($scope, $rootScope, $location,$http) {
	$scope.login=function(username,password){
		if(username=='j@j.com' && password=='1'){
			$rootScope.isAuthenticated = true;
			$location.path('/main');
		}else{
			$scope.errorMessage = 'User / Password Invalid';
		}
	};
}]);
