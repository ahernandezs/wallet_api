'use strict';

angular.module('pantallasAdministradorApp')
  .controller('detailCtrl', ['$scope', '$rootScope', '$location', '$http', '$routeParams', function ($scope, $rootScope, $location, $http, $routeParams) {
    
    if($rootScope.isAuthenticated == null || $rootScope.isAuthenticated == false){
        $location.path('/login');
    }else{

        $http({
            url: '/api/spa/loans/'+$routeParams.phoneId,
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.loans = data.additionalInfo;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
            $scope.status = status;
            $scope.buttonStatus("Entrar", false);
        });



    };

    $scope.logOut=function(){
        $rootScope.isAuthenticated = false;
        $location.path('/login');
	 };

}]);
