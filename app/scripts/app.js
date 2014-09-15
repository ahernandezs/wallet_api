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
        controller: 'LoginCtrl',
        url: 'login'
      })
       .when('/mainAccount', {
        templateUrl: 'views/mainAccount.html',
        controller: 'MainAccountCtrl',
        url: 'main'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
