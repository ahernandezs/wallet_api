'use strict';

angular.module('pantallasAdministradorApp')
.controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$http',  function ($scope, $rootScope, $location,$http) {
	$scope.login=function(username,password){
		if(username=='admin@amdocs.com' && password=='admin321'){
			$rootScope.isAuthenticated = true;
			$location.path('/main');
		}else{
			$scope.errorMessage = 'User / Password Invalid';
		}
	};
}]);
