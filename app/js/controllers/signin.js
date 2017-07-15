'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', 'API', 'MD5', '$state', '$localStorage', 
  function($scope, API, MD5, $state, $localStorage) {
    $scope.user = {};
    $scope.authError = null;
    $scope.avatar = $localStorage.avatar;

    $scope.login = function(username, password, need_encrypt) {
      API.loading();
      API.login(username, need_encrypt ? MD5.encrypt(password) : password).then(
        function(res) {
          API.stop_loading();
          if(!res.status)
            $scope.authError = res.info;
          else 
            $state.go('app.dashboard-v1');
        });
    };

    if($localStorage.authenticated) {
      $scope.user.username = $localStorage.username;
      $scope.user.password = $localStorage.password;
      $scope.login($localStorage.username, $localStorage.password, false);
    }

  }])
;