'use strict';

angular.module('pantallasAdministradorApp')
.controller('LeaderBoardCtrl', ['$scope', '$rootScope', '$location','$http','$filter', 'ngTableParams','$timeout',function ($scope, $rootScope, $location ,$http , $filter, ngTableParams,$timeout){
  var dataset;


  var socket = io.connect('http://localhost:8082');
  socket.on('connect', function(){
      // call the server-side function 'adduser' and send one parameter (value of prompt)
      socket.emit('adduser', 6666);
  });

  socket.on('update_event', function (payload) {
    console.log('Incoming Message');
    //$scope['tableParams'] = {reload:function(){},settings:function(){return {}}};
    //$scope['tableParams'].settings().$scope = scope;
    //$timeout(reset, 3000);
    $http({
        url: '/api/leaderboard',
        method: 'GET',
    }).
      success(function(data, status, headers) {
        dataset = data;
        $scope.tableParams.reload();
    }).
      error(function(data, status) {
        $scope.errorMessage = data.message;
    });
    //$scope.tableParams.reload();
    });

   $scope.tableParams = new ngTableParams({
       page: 1, // show first page
       count: 10, // count per page
       sorting: {
           name: 'asc' // initial sorting
       }
   }, {
       total: function () {
           return dataset.length;
       }, // length of data
       getData: function ($defer, params) {
          $timeout(function() {
                // update table params
                console.log('inside timeout')
                if(dataset){
                  params.total(dataset.users.length);
                // set new data
                  $defer.resolve(dataset.users);
                }
            }, 500);
        },
       $scope: {
           $data: {}
       }
   });

  $scope.doSearch = function () {
    $scope.tableParams.reload();
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
