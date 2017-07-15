'use strict';

/* Controllers */

  // Form controller
app.controller('FormDemoCtrl', ['$scope', 'API', 'MD5', 
  function($scope, API, MD5) {
    API.get_employee_info(API.user_info().sectionID, API.user_info().ID)
    .then(function(res) {
      $scope.email = res['email'][0];
      $scope.other_email = res['email'][1];
      $scope.phone = res['phone'][0];
      $scope.other_phone = res['phone'][1];
    })

    $scope.update_info = function() {
      API.loading();
      var info = {
        email1: $scope.email,
        email2: $scope.other_email,
        phone1: $scope.phone,
        phone2: $scope.other_phone};
      if($scope.password && $scope.password !== "")
        info['newPwd'] = MD5.encrypt($scope.password);
      API.update_employee_info(API.user_info().sectionID, API.user_info().ID, info)
      .then(function(res) {
        API.stop_loading();        
      })
    }

}]);