'use strict';

angular.module('pantallasAdministradorApp')
  .controller('detailCtrl', ['$scope', '$rootScope', '$location', '$http', '$routeParams', '$filter', 'ngTableParams', function ($scope, $rootScope, $location, $http, $routeParams, $filter, ngTableParams) {
    //if(false){
    if($rootScope.isAuthenticated == null || $rootScope.isAuthenticated == false){
        $location.path('/login');
    }else{

        $http({
            url: '/api/spa/loans/'+$routeParams.phoneId,
            method: 'GET',
        }).
          success(function(data, status, headers) {

            $scope.loans = data.additionalInfo;

            $scope.tableParamsloans = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    date: 'asc'
                },
            }, {
                total: $scope.loans.length,
                getData: function($defer, params) {
                    $scope.loans = params.sorting() ?
                                        $filter('orderBy')($scope.loans, params.orderBy()) :
                                        $scope.loans;
                    var orderedData = $scope.loans;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

        $http({
            url: '/api/spa/receipts/'+$routeParams.phoneId,
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.receipts = data.additionalInfo;

            $scope.tableParamsreceipts = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    date: 'asc'
                }
            }, {
                total: $scope.receipts.length,
                getData: function($defer, params) {
                    $scope.receipts = params.sorting() ?
                                        $filter('orderBy')($scope.receipts, params.orderBy()) :
                                        $scope.receipts;
                    var orderedData = $scope.receipts;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

        $http({
            url: '/api/spa/transactions/'+$routeParams.phoneId+'/money',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.moneys = data.additionalInfo;

            $scope.tableParamsmoney = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    date: 'asc'
                }
            }, {
                total: $scope.moneys.length,
                getData: function($defer, params) {
                    $scope.moneys = params.sorting() ?
                                        $filter('orderBy')($scope.moneys, params.orderBy()) :
                                        $scope.moneys;

                    var orderedData = $scope.moneys;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

        $http({
            url: '/api/spa/transactions/'+$routeParams.phoneId+'/dox',
            method: 'GET',
        }).
          success(function(data, status, headers) {
            $scope.doxs = data.additionalInfo;

            $scope.tableParamsdoxs = new ngTableParams({
                page: 1,
                count: 10,
                sorting: {
                    date: 'asc'
                }
            }, {
                total: $scope.doxs.length,
                getData: function($defer, params) {
                    $scope.doxs = params.sorting() ?
                                        $filter('orderBy')($scope.doxs, params.orderBy()) :
                                        $scope.doxs;
                    var orderedData = $scope.doxs;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

        }).
          error(function(data, status) {
            $scope.errorMessage = data.message;
        });

    };

    $scope.logOut=function(){
        $rootScope.isAuthenticated = false;
        $location.path('/login');
	 };

    $scope.main = function(){
        $location.path('/main');
    };

    $scope.resetDox = function(){
        console.log('Reset Dox to user -> ' + $routeParams.phoneId);
        $http({
            url: '/api/dox/'+$routeParams.phoneId,
            method: 'DELETE'
        }).
           success(function(data, status, headers) {
                console.log('Deleted Correctly!');
                $scope.totalDeleted = data.total;
                $scope.deletedDoxDetails = data.additionalInfo;

                console.log(data);

                if (data.statusCode === 0)
                    alert('Successful!');
                else
                    alert('Dox already reset!');

                $location.path('/main');
            }).
            error(function(data, status) {
                console.log(data.message);
                $scope.errorMessage = data.message;
            });
    };

    $scope.deleteUser = function() {
        console.log('Delete user -> ' + $routeParams.phoneId);
        $http({
            url: '/api/register/' + $routeParams.phoneId,
            method: 'DELETE',
            data: {
                confirm: 'YES'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).
            success(function (data, status, headers) {
                $scope.deletedUserInfo = data.additionalInfo;
                $scope.deletedUser = data.deleted;

                if (data.statusCode == 0)
                    alert('Successful!');
                else
                    alert('Error deleting user!');
                $location.path('/main');

            }).
            error(function (data, status) {
                console.log(data.message);
                $scope.errorMessage = data.message;
            });
    };

    $scope.topUp = function(topUpAmount){
            if (!topUpAmount)
                alert('You must put number!');
            else
                $http({
                    url: '/api/money/' + $routeParams.phoneId,
                    method: 'PUT',
                    data: {
                        amount: topUpAmount
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).
                    success(function (data, status, headers) {
                        $scope.topUpInfo = data.additionalInfo;

                        if (data.statusCode === 0)
                            alert('Successful! ' + $scope.topUpInfo.message);
                        else
                            alert('Error while top up account! \nDetail error:' + $scope.topUpInfo);

                    }).
                    error(function (data, status) {
                        console.log(data.message);
                        $scope.errorMessage = data.message;
                    });

    };
}]);