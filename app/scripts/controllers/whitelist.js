/**
 * Created by nemux on 10/02/16.
 */

'use strict';


angular.module('pantallasAdministradorApp')
    .controller('EditableRowCtrl', ['$scope', '$rootScope', '$location', '$http', '$filter', 'ngTableParams',
        function ($scope, $rootScope, $location, $http, $filter, ngTableParams) {

    $scope.users = [];
    $scope.loadBlackListUsers = function(){
      return $scope.users.length ? null : $http({
          url: '/api/spa/whitelist',
          method: 'GET',
      }).success(function(data, status, headers){
          if (data.statusCode == 0)
              for(var i = 0; i < data.additionalInfo.length; i++ )
                  data.additionalInfo[i].id = i;

          $scope.users = data.additionalInfo;
      });
    };

    $scope.getAllNotBlackistedUsers = function(){
       return $http({
            url: '/api/spa/whitelist?reverse=true',
            method: 'GET',
        }).
            success(function(data, status, headers) {
                $scope.tableParams = new ngTableParams({
                    page: 1,
                    count: 5,
                    sorting: {
                        name: 'asc'
                    }
                }, {
                    total: data.additionalInfo.length,
                    getData: function($defer, params) {

                        var orderedData = params.sorting() ?
                            $filter('orderBy')(data.additionalInfo, params.orderBy()) :
                            data.additionalInfo;

                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            }).
            error(function(data, status) {
                $scope.errorMessage = data.message;
            });
    };

    $scope.addToWihiteList = function(user){
        console.log(user);
        /*
        $http({
            url: '/api/spa/whitelist',
            method: 'POST',
            data: { phoneId: user.phoneID }
        }).success(function(data, status, headers){
            console.log(data)
            $scope.inserted = {
                id: $scope.users.length,
                phoneID: data.additionalinfo.phoneID,
                name: data.additionalinfo.name ? data.additionalinfo.name : 'User not registered',
                email: data.additionalinfo.email ? data.additionalinfo.email : 'User not registered'
            };
            $scope.users.push($scope.inserted);
        });*/

        $scope.inserted = {
            id: $scope.users.length,
            phoneID: user.phoneID,
            name: user.name,
            email: user.email
        };
        $scope.users.push($scope.inserted);

    };

    $scope.saveUser = function(data, id) {
        //$scope.user not updated yet
        console.log(id);
        var oldPhoneId = null;
        angular.extend(data, {id: id});
        console.log('Modificando usuario...');
        console.log(data);

        if (data.phoneID == null || data.phoneID == 'Insert PhoneID')
            return alert ('You MUST insert a valid phoneID');

        if (id <= $scope.users.length && $scope.users[id].phoneID != 'Insert PhoneID')
           oldPhoneId = $scope.users[id].phoneID;

        console.log(oldPhoneId);

        if (oldPhoneId && oldPhoneId != data.phoneID) {
            console.log('Editado viejo');

            $http({
                url:'/api/spa/whitelist/' + oldPhoneId,
                method: 'DELETE'
            }).success(function(data2, status, headers){
                return $http({
                    url: '/api/spa/whitelist',
                    method: 'POST',
                    data: { phoneId: data.phoneID }
                }).success(function(data3, status, headers){
                    console.log('User updated!');
                    console.log('Old -> ' + oldPhoneId);
                    console.log('New -> ' + data.phoneID);
                    $scope.users[id].name = data2.name;
                    $scope.users[id].email = data2.email;
                });
            });

        } else {
            console.log('Nuevo');
            return  $http({
                url: '/api/spa/whitelist',
                method: 'POST',
                data: { phoneId: data.phoneID }
            }).success(function(data4, status, headers){
                $scope.users[id].name = data4.additionalinfo.name;
                $scope.users[id].email = data4.additionalinfo.email;
                console.log($scope.users[id].name);
                console.log($scope.users[id].email);

            });
        }
    };

    // remove user
    $scope.removeUser = function(index) {
        var removed_user = $scope.users[index];
        return !removed_user ? null : $http({
            url:'/api/spa/whitelist/' + removed_user.phoneID,
            method: 'DELETE'
        }).success(function(data, status, headers){
            $scope.users.splice(index, 1);
        });
    };

    // add user
    $scope.addUser = function() {
        $scope.inserted = {
            id: $scope.users.length,
            phoneID: 'Insert PhoneID',
            name: '',
            email: ''
        };
        $scope.users.push($scope.inserted);
    };

    $scope.getAllNotBlackistedUsers();
    $scope.loadBlackListUsers();
}]);