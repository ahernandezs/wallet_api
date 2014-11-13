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
        });

        $http({
            url: '/api/spa/receipts/'+$routeParams.phoneId,
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.receipts = data.additionalInfo;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

        $http({
            url: '/api/spa/transactions/'+$routeParams.phoneId+'/money',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.moneys = data.additionalInfo;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

        $http({
            url: '/api/spa/transactions/'+$routeParams.phoneId+'/dox',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.doxs = data.additionalInfo;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

    };

    $scope.logOut=function(){
        $rootScope.isAuthenticated = false;
        $location.path('/login');
	 };

    $scope.main = function(){
        $location.path('/main');
    }
}]);
