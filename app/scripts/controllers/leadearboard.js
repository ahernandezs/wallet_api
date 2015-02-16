'use strict';

angular.module('pantallasAdministradorApp')
.controller('LeaderBoardCtrl', ['$scope', '$rootScope', '$location','$http','$filter', 'ngTableParams','$timeout',function ($scope, $rootScope, $location ,$http , $filter, ngTableParams,$timeout){

    $http({
        url: '/api/leaderboard',
        method: 'GET',
    }).
      success(function(data, status, headers) {
        console.log('Incoming Message Init' + JSON.stringify(data));
        $scope['tableParams']  = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {
                dox: 'asc'
            }
        }, {
            total: data.users.length,
            getData: function($defer, params) {
                        /*
                        //var orderedData = params.sorting() ?
                         //                   $filter('orderBy')(data.users, params.orderBy()) :
                         //                   data.users;
                         params.settings({ counts: data.length > 10 ? [10, 25, 50] : []});
                         $defer.resolve(data.users);*/
                                     // use build-in angular filter
                          var filteredData = params.filter() ?
                                  $filter('filter')(data, params.filter()) :
                                  data;
                          var orderedData = params.sorting() ?
                                  $filter('orderBy')(filteredData, params.orderBy()) :
                                  data;

                          params.total(orderedData.length); // set total for recalc pagination
                          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

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
    $scope['tableParams'] = {reload:function(){},settings:function(){return {}}};
    $scope['tableParams'].settings().$scope = scope;
    $timeout(reset, 1000);
  })

  var reset = function(){
    console.log('Reset ....');
    $scope['tableParams'] = null;
      $http({
        url: '/api/leaderboard',
        method: 'GET',
    }).
      success(function(data, status, headers) {
        $scope['tableParams'] = new ngTableParams({
            page: 1,
            count: 25,
        }, {
            total: data.users.length,
            getData: function($defer, params) {
                      /*var orderedData = params.sorting() ?
                                        $filter('orderBy')(data.users, params.orderBy()) :
                                        data.users;
                      //params.settings({ counts: data.length > 10 ? [10, 25, 50] : []});
                      params.total(orderedData.length); // set total for recalc pagination
                      $defer.resolve(orderedData.users)*/
                                  // use build-in angular filter
                            var filteredData = params.filter() ?
                            $filter('filter')(data, params.filter()) :data;
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) :data;
                            params.total(orderedData.length); // set total for recalc pagination
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                     }
             });
    }).
      error(function(data, status) {
        $scope.errorMessage = data.message;
    });
  }

  $scope.doSearch = function () {
    $scope['tableParams'].reload();
    }
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
