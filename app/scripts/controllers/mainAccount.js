'use strict';

angular.module('pantallasAdministradorApp')
  .controller('MainAccountCtrl', function ($scope, $location) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.users = [{id: 12345, className: 50, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 23456, className: 43, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 34567, className: 27, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 45678, className: 29, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"},
                {id: 56789, className: 34, methodName: "validar usuario", elapsedTime: 123, createdAt: "12/03/2012"}];

    $scope.logOut=function(){
			$scope.isAuthenticated = false;
	 		$location.path('/login');
	 };   

	$scope.chart = {
    options: {
        chart: {
            type: 'bar'
        }
    },
    series: [{
        data: [10, 15, 12, 8, 7]
    }],
    title: {
        text: 'Hello'
    },
    loading: false
} 
  });

