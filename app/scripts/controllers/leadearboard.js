'use strict';

angular.module('pantallasAdministradorApp')
.controller('LeaderBoardCtrl', ['$scope', '$rootScope', '$location','$http','$filter', 'ngTableParams', function ($scope, $rootScope, $location ,$http , $filter, ngTableParams){

    $http({
        url: '/api/leaderboard',
        method: 'GET',
    }).
      success(function(data, status, headers) {
        console.log('Incoming Message Init' + JSON.stringify(data));
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {
                dox: 'asc'
            }
        }, {
            total: data.users.length,
            getData: function($defer, params) {
                        //var orderedData = params.sorting() ?
                         //                   $filter('orderBy')(data.users, params.orderBy()) :
                         //                   data.users;
                         params.settings({ counts: data.length > 10 ? [10, 25, 50] : []});
                         $defer.resolve(data.users);
                     }
                 });
    }).
      error(function(data, status) {
        $scope.errorMessage = data.message;
    });

  var socket = io.connect('http://localhost:8082');
  socket.on('connect', function(){
      // call the server-side function 'adduser' and send one parameter (value of prompt)
      socket.emit('adduser', 6666);
  });

  socket.on('update_event', function (payload) {
    console.log('Incoming Message' + JSON.stringify(payload));
    //$scope.tableParams = null;
    //$scope.tableParams.reload();
    //$scope.reset();
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        sorting: {
            dox: 'asc'
        }
    }, {
        total: payload.users.length,
        getData: function($defer, params) {
            var data =  payload.users;
            var orderedData = data;
            params.settings({ counts: payload.length > 10 ? [10, 25, 50] : []});
            $defer.resolve(orderedData);
        }
    });
  })

  $scope.reset=function(){
    console.log('Reset ....');
      $http({
        url: '/api/leaderboard',
        method: 'GET',
    }).
      success(function(payload, status, headers) {
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {
                dox: 'asc'
            }
        }, {
            total: payload.users.length,
            getData: function($defer, params) {
                    var data =  payload.users;
                    var orderedData = data;
                    params.settings({ counts: payload.length > 10 ? [10, 25, 50] : []});
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                 }
             });
        $scope.tableParams.settings().$scope = $scope;
    }).
      error(function(data, status) {
        $scope.errorMessage = data.message;
    });
  }

  $scope.doSearch = function () {
    $scope.tableParams.reload();
    }

$scope.tableParams.reload();
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
