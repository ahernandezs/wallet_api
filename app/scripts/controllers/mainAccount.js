'use strict';

angular.module('pantallasAdministradorApp')
  .controller('MainAccountCtrl', ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {
    if($rootScope.isAuthenticated == null || $rootScope.isAuthenticated == false){
        $location.path('/login');
    }else{
        $http({
            url: '/api/spa/users',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.users = data.additionalInfo;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });
    }

    $scope.logOut = function(){
        $rootScope.isAuthenticated = false;
        $location.path('/login');
	 };

    $scope.detail = function(user){
      $location.path('/detail/'+user.phoneID);
    }

}]);
