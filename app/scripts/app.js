'use strict';

angular.module('pantallasAdministradorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngTable',
  'ui.bootstrap',
  'xeditable'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
       .when('/main', {
        templateUrl: 'views/mainAccount.html',
        controller: 'MainAccountCtrl'
      })
       .when('/detail/:phoneId', {
        templateUrl: 'views/detail.html',
        controller: 'detailCtrl'
      })
       .when('/leaderboard', {
        templateUrl: 'views/leaderboard.html',
        controller: 'LeaderBoardCtrl'
      })
      .when('/websockets', {
        templateUrl: 'views/webSocket.html'
      })
      .when('/whitelist', {
        templateUrl: 'views/whitelist.html',
        controller: 'EditableRowCtrl'
      })
      .when('/tv', {
        templateUrl: 'views/tv.html',
        controller: 'tvCtrl'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
