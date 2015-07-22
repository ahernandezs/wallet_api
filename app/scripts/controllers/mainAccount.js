'use strict';

angular.module('pantallasAdministradorApp')
  .controller('MainAccountCtrl', ['$scope', '$rootScope', '$location', '$http', '$filter', 'ngTableParams', function ($scope, $rootScope, $location, $http, $filter, ngTableParams) {
    if($rootScope.isAuthenticated == null || $rootScope.isAuthenticated == false){
        $location.path('/login');
    }else{
        $http({
            url: '/api/spa/users',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.tableParams = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    name: 'asc'
                }
            }, {
                total: data.additionalInfo.users.length,
                getData: function($defer, params) {
                    $rootScope.countPublic = data.additionalInfo.public;
                    $rootScope.countInternal = data.additionalInfo.internal;
                    var orderedData = params.sorting() ?
                                        $filter('orderBy')(data.additionalInfo.users, params.orderBy()) :
                                        data.additionalInfo.users;

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
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
