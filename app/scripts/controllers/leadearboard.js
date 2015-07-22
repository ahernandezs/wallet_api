'use strict';

angular.module('pantallasAdministradorApp')
.controller('LeaderBoardCtrl', ['$scope', '$rootScope', '$location','$http','$filter', 'ngTableParams','$timeout',function ($scope, $rootScope, $location ,$http , $filter, ngTableParams,$timeout){
  var dataset;
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
                  params.settings({ counts: dataset.users.length > 10 ? [10, 25, 50] : []});
                  $defer.resolve(dataset.users);
                }else{
                  params.settings({ counts:[]});
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
                }
            }, 10);
        },
       $scope: {
           $data: {}
       }
   });
  var socket = io.connect('amdocs.anzen.io');
  socket.on('connect', function(){
      socket.emit('adduser',createGUID());
  });

  socket.on('update_event', function (payload) {
    console.log('Incoming Message');
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
    });

   var createGUID = function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
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

angular.module('pantallasAdministradorApp')
.filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
});

angular.module('pantallasAdministradorApp')
  .filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});
