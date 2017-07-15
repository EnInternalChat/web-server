app.controller('ContactCtrl', ['$scope', 'API', '$filter', '$stateParams', 'MD5',
  function($scope, API, $filter, $stateParams, MD5) {

  $scope.filter = '';
  $scope.groups = [];
  $scope.group_hash = new Array();
  $scope.items = [];
  $scope.status_old;

  $scope.init_data = function() {
    API.loading();
    Promise.all([$scope.get_company_info(), $scope.get_all_employees()])
    .then(function(res) {
      API.stop_loading();
    })
  }

  $scope.get_company_info = function() {
    return API.get_company_info().then(function(res) {
      var root_section = res.organization;
      $scope.group_hash[root_section['ID']] = root_section['name'];
      $scope.groups.push({
        name: root_section['name'],
        id: root_section['ID']
      });
      $scope.findGroupInTree(root_section['childrenSections']);
      if($stateParams['selected_section']) {
        $scope.selectGroup($scope.findGroupInList(
          parseInt($stateParams.selected_section)));
      }
    });
  }

  $scope.get_all_employees = function() {
    return API.get_all_employees().then(function(res) {
      res.forEach((item) => {
        $scope.items.push({
          id: item['ID'],
          group_id: item['sectionID'],
          group_name: "",
          name: item['name'],
          avatar: "img/" + item['avatar'] + ".png",
          phone: item['phone'][0],
          other_phone: item['phone'][1],
          email: item['email'][0],
          other_email: item['email'][1],
          leader: item['leader'],
          status: item['status']
        })
      })
    })    
  }

  $scope.findGroupInTree = function(children) {
    if(children.length === 0)
      return;
    else {
      children.forEach((item) => {
        $scope.group_hash[item['ID']] = item['name'];
        $scope.groups.push({
          name: item['name'],
          id: item['ID']
        });
        $scope.findGroupInTree(item['childrenSections']);
      });
    }
  };

  $scope.findGroupInList = function(id) {
    for(var i = 0, n = $scope.groups.length; i < n; i++) {
      if($scope.groups[i].id === id)
        return $scope.groups[i];
    }
    return $scope.groups[0];
  }

  $scope.checkItem = function(obj, arr, key){
    var i=0;
    angular.forEach(arr, function(item) {
      if(item[key].indexOf( obj[key] ) == 0){
        var j = item[key].replace(obj[key], '').trim();
        if(j){
          i = Math.max(i, parseInt(j)+1);
        }else{
          i = 1;
        }
      }
    });
    return obj[key] + (i ? ' '+i : '');
  };

  $scope.deleteGroup = function(item){
    $scope.groups.splice($scope.groups.indexOf(item), 1);
  };

  $scope.selectGroup = function(item){  
    $scope.groups.forEach((item) => {
      item.selected = false;
    });
    $scope.group = item;
    $scope.group.selected = true;
    $scope.filter = item.id;
  };

  $scope.selectItem = function(item){    
    $scope.items.forEach((item) => {
      item.selected = false;
      item.editing = false;
    });
    $scope.item = item;
    $scope.item.selected = true;
    $scope.status_old = $scope.item.status;
  };

  $scope.deleteItem = function(item){
    API.alert('确认删除该用户吗？', $scope, function() {
      API.loading();
      API.delete_employee($scope.group.id, item.id).then(function(res) {
        if(res.info == '删除成功') {
          $scope.items.splice($scope.items.indexOf(item), 1);
          $scope.item = null;
        }
        API.stop_loading();
      })
    })
  };

  $scope.createItem = function(){
    API.alert_prompt('新建用户', '用户姓名', function(name) {
      API.loading();
      API.new_employee($scope.group.id, {
        name: name,
        password: MD5.encrypt(name),
        gender: true,
        position: "部员"
      }).then(function(res){
        if(res.body.info === '员工添加成功') {
          API.get_employee_info($scope.group.id, res.body.ID)
          .then(function(res) {
            var item = {
              id: res['ID'],
              group_id: res['sectionID'],
              group_name: "",
              name: res['name'],
              avatar: "img/" + res['avatar'] + ".png",
              phone: res['phone'][0],
              other_phone: res['phone'][1],
              email: res['email'][0],
              other_email: res['email'][1],
              leader: res['leader'],
              status: res['status']
            }
            $scope.items.push(item);
            $scope.selectItem(item);
            $scope.item.editing = false;
            API.stop_loading();
          })
        }
        else
          API.stop_loading();
      })
    })
  };

  $scope.editItem = function(item){
    if(item && item.selected){
      item.editing = true;
      $scope.status_old = item.status;
    }
  };

  $scope.doneEditing = function(item){
    API.alert('确认保存修改?', $scope, function() {
      API.loading();
      API.update_employee_info($scope.group.id, item.id, {
        email1: item.email,
        email2: item.other_email,
        phone1: item.phone,
        phone2: item.other_phone,
        newSectionID: item.group_id
      }).then(function(res) {
        if($scope.status_old != item.status) {
          API.update_employee_status($scope.group.id, item.id).then(function(res) {
            API.stop_loading();
            item.editing = false;
          })
        }
        else {
          API.stop_loading();
          item.editing = false;
        }
      });      
    });
  };

  $scope.init_data();

}]);