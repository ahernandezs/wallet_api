'use strict';

angular.module('pantallasAdministradorApp')
.controller('LoginCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
	$scope.login=function(username,password){
		if(username=='admin@amdocs.com' && password=='admin321'){
			$rootScope.isAuthenticated = true;
			$location.path('/mainAccount');
		}else{
			$scope.errorMessage = 'User / Password Invalid';
		}
	};
}]);
