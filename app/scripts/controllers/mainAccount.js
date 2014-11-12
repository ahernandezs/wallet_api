'use strict';

angular.module('pantallasAdministradorApp')
  .controller('MainAccountCtrl', ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {

    //if($rootScope.isAuthenticated == null || $rootScope.isAuthenticated == false){
    if(false){
        $location.path('/login');
    }else{
        $http({
            url: '/api/spa/users',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.users = data;
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
            $scope.status = status;
            $scope.buttonStatus("Entrar", false);
        });
    }

    $scope.logOut=function(){
        $rootScope.isAuthenticated = false;
        $location.path('/login');
	 };


    /*$scope.users = [{id: 12345, className: 50, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 23456, className: 43, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 34567, className: 27, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 45678, className: 29, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 56789, className: 34, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"}];
    */

	/*$scope.chart = {
        options: { chart: { type: 'bar' } },
        series: [{ data: [10, 15, 12, 8, 7] }],
        title: { text: 'Users' },
        loading: false;
    }*/

}]);
