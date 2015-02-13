'use strict';

angular.module('pantallasAdministradorApp')
.controller('LeaderBoardCtrl', ['$scope', '$rootScope', '$location','$http','$filter', 'ngTableParams', function ($scope, $rootScope, $location ,$http , $filter, ngTableParams){
  $http({
            url: '/api/leaderboard',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.tableParams = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    dox: 'asc'
                }
            }, {
                total: data.users.length,
                getData: function($defer, params) {
                    var orderedData = params.sorting() ?
                                        $filter('orderBy')(data.users, params.orderBy()) :
                                        data.users;
                     params.settings({ counts: data.length > 10 ? [10, 25, 50] : []});
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });


}]);

angular.module('pantallasAdministradorApp')
.directive('fallbackSrc', function () {
    var fallbackSrc = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.bind('error', function() {
                angular.element(this).attr("src", iAttrs.fallbackSrc);
            });
        }
    }
    return fallbackSrc;
});
