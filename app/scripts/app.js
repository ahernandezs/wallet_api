'use strict';

angular.module('pantallasAdministradorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngTable'
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
      .otherwise({
        redirectTo: '/login'
      });
  });
