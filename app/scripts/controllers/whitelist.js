/**
 * Created by nemux on 10/02/16.
 */


angular.module('pantallasAdministradorApp')
    .controller('EditableRowCtrl', ['$scope', '$rootScope','$http', function($scope, $rootScope, $http) {

    $scope.users = [];
    $scope.loadBlackListUsers = function(){
      return $scope.users.length ? null : $http({
          url: '/api/spa/whitelist',
          method: 'GET',
      }).success(function(data, status, headers){
          if (data.statusCode == 0)
              for(var i = 0; i < data.additionalInfo.length; i++ )
                  data.additionalInfo[i].id = (i+1);

          $scope.users = data.additionalInfo;
      });
    };

    $scope.saveUser = function(data, id) {
        //$scope.user not updated yet
        angular.extend(data, {id: id});
        console.log('Modoficando usuario...');
        console.log(data);

        if (data.phoneID == null || data.phoneID == 'Insert PhoneID')
            return alert ('You MUST insert a valid phoneID');

        return  $http({
                url: '/api/spa/whitelist',
                method: 'POST',
                data: { phoneId: data.phoneID }
            }
        );
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
            id: $scope.users.length+1,
            phoneID: 'Insert PhoneID',
            name: '',
            email: ''
        };
        $scope.users.push($scope.inserted);
    };

    $scope.loadBlackListUsers();
}]);