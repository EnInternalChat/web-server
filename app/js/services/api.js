'use strict';

angular.module('API.Services', [])
.service('API', ['$http', '$q', '$window', '$localStorage', '$ngConfirm', '$rootScope',
  function($http, $q, $window, $localStorage, $ngConfirm, $rootScope){
  var loading_dom = null;
  // var base_url = "https://t.garenfeather.cn/EnInternalChat";
  // var base_url = "https://118.89.110.77/EnInternalChat";
  // var base_url = "http://10.42.0.186";
  var base_url = "https://106.15.186.180/EnInternalChat";
  var user = {};

  var obj2param = function(obj) {
    if(!obj)
      return '';
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    for(name in obj) {
      value = obj[name];
      if(value instanceof Array) {
        for(i = 0; i < value.length; i++) {
          subValue = value[i];
          fullSubName = name;
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += obj2param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += obj2param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
    return query;
  }

  var get = function(url, param) {
    var deffered = $q.defer();
    $http({
      method: 'GET',
      url: url + '?' + obj2param(param),
      headers: { 
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-auth-token": $localStorage.token,
        "Platform": "web"
      }
    }).success(function(res) {
      deffered.resolve(res);
    }).error(function(error) {
      deffered.reject(error);
    });
    return deffered.promise;
  }

  var post = function(url, body) {
    var deffered = $q.defer();
    $http({
      method: 'POST',
      url: url,
      headers: { 
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-auth-token": $localStorage.token,
        "Platform": "web"
      },
      data: body,
      transformRequest: function(obj) {
        return obj2param(obj);
      }
    }).success(function(data, status, headers) {
      deffered.resolve({
        body: data,
        headers: headers
      });
    }).error(function(error) {
      deffered.reject(error);
    });
    return deffered.promise;    
  }

  var post_file = function(url, body) {
    var deffered = $q.defer();
    $http({
      method: 'POST',
      url: url,
      headers: {
        "Accept": "*/*",
        "Content-Type": "multipart/form-data",
        "x-auth-token": $localStorage.token,
        "Platform": "web"        
      },
      data: body,
      transformRequest: function(data, headersGetter) {
        var form_data = new FormData();
        for(var key in data) {
          form_data.append(key, data[key]);
        }
        var headers = headersGetter();
        delete headers['Content-Type'];
        return form_data;
      }
    }).success(function(data, status, headers) {
      deffered.resolve({
        body: data,
        headers: headers
      });
    }).error(function(error) {
      deffered.reject(error);
    });
    return deffered.promise; 
  }

  var _delete = function(url) {
    var deffered = $q.defer();
    $http({
      method: 'DELETE',
      url: url,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        "Access-Control-Allow-Origin": "*",
        "x-auth-token": $localStorage.token,
        "Platform": "web"
      }
    }).success(function(res) {
      deffered.resolve(res);
    }).error(function(error) {
      deffered.reject(error);
    });
    return deffered.promise;    
  }

  this.user_info = function() {
    return user;
  }

  this.alert = function(text, scope, callback) {
    $ngConfirm({
      theme: 'material',
      closeIcon: true,
      animation: 'RotateX',
      closeAnimation: 'RotateXR',
      animationSpeed: 300,
      title: text,
      content: '',
      scope: scope,
      buttons: {
        '确认': callback
      }
    });
  }

  this.alert_prompt = function(text, input_tag, callback) {
    $ngConfirm({
      title: text,
      contentUrl: 'prompt.html',
      theme: 'material',
      closeIcon: true,
      animation: 'RotateX',
      closeAnimation: 'RotateXR',
      animationSpeed: 300,
      buttons: {
         ok : {
          text: '确认',
          disabled: true,
          btnClass: 'btn-blue',
          action: function(scope) {
            callback(scope.name)
          },
          later: function() {}
        }
      },
      onScopeReady: function (scope) {
        var self = this;
        scope.tag = input_tag;
        scope.textChange = function () {
          if (scope.name)
            self.buttons.ok.setDisabled(false);
          else
            self.buttons.ok.setDisabled(true);
        }
      }
    });    
  }

  this.loading = function() {
    if(!loading_dom) 
      loading_dom = angular.element(document.querySelector('#loading-bg'));
    loading_dom.css('display', 'flex');
  }

  this.stop_loading = function() {
    if(!loading_dom)
      loading_dom = angular.element(document.querySelector('#loading-bg'));
    loading_dom.css('display', 'none');
  }

  this.login = function(username, pwd) {
    return post(base_url + '/login', {
      name: username,
      password: pwd
    }).then(function(res, status, headers, config) {
      if(!res.body.status)
        return {
          status: false,
          info: res.body.info
        }
      else {
        $localStorage.authenticated = true;
        $localStorage.token = res.headers()['x-auth-token'];
        $localStorage.username = username;
        $localStorage.password = pwd;
        user = res.body;
        $localStorage.avatar = user['avatar'];
        user['username'] = username;
        user['admin'] = (user['sectionID'] == -1);
        $rootScope.user = user;
        return { status: true }        
      }
    },
    function(error) {
      return {
        status: false,
        info: error
      }
    });
  }

  this.logout = function() {
    return post(base_url + '/logout', null).then(
      function(res) {
        $localStorage.authenticated = false;
        $localStorage.token = "";
        return true;
      },
      function(error) {
        return true;
      });
  }

  this.get_company_info = function() {
    return get(base_url + '/company/' + user.companyID, null);
  }

  this.new_section = function(parent_section, name, description) {
    return post(base_url + '/company/' + user.companyID + '/' + 
      parent_section, {
        name: name,
        description: description
      });
  }

  this.delete_section = function(section_id) {
    return _delete(base_url + '/company/' + user.companyID + '/sections/' 
      + section_id);
  }

  this.update_section_info = function(section_id, info) {
    return post(base_url + '/company/' + user.companyID + '/sections/'
      + section_id, info);
  }

  this.get_section_info = function(section_id) {
    return get(base_url + '/company/' + user.companyID + '/sections/'
      + section_id, null);
  }

  this.get_all_employees = function() {
    return get(base_url + '/employees/' + user.companyID, null);
  }

  this.get_section_members = function(section_id) {
    return get(base_url + '/employees/' + user.companyID + '/' + 
      section_id, null);
  }

  this.new_employee = function(section_id, data) {
    return post(base_url + '/employees/' + user.companyID + '/' +
      section_id, data);
  }

  this.get_employee_info = function(section_id, id) {
    return get(base_url + '/employees/' + user.companyID + '/' +
      section_id + '/' + id, null);
  }

  this.delete_employee = function(section_id, user_id) {
    return _delete(base_url + '/employees/' + user.companyID + '/' +
      section_id + '/' + user_id);
  }

  this.update_employee_info = function(section_id, user_id, info) {
    return post(base_url + '/employees/' + user.companyID + '/' + 
      section_id + '/' + user_id, info);
  }

  this.update_employee_status = function(section_id, user_id) {
    return get(base_url + '/employees/status/' + user.companyID + '/'
      + section_id + '/' + user_id);
  }

  this.read_notice = function(notice_id) {
    return get(base_url + '/notifications/' + user.ID + '/' + notice_id, null); 
  }

  this.get_receive_notice = function(is_read) {
    if(is_read) {
      return get(base_url + '/notifications/received/read/' + user.ID, null);
    }
    else {
      return get(base_url + '/notifications/received/unread/' + user.ID, null);
    }
  }

  this.get_send_notice = function() {
    return get(base_url + '/notifications/sent/' + user.ID, null);
  }

  this.delete_received_notice = function(id) {
    return _delete(base_url + '/notifications/received/' + user.ID + '/' + id);      
  }

  this.delete_send_notice = function(id) {
    return _delete(base_url + '/notifications/sent/' + user.ID + '/' + id);
  }

  this.send_notice = function(receivers, title, content) {
    return post(base_url + '/notifications/send/' + user.ID, {
      receivers: receivers,
      title: title,
      content: content
    });
  }

  this.get_task_detail = function(id) {
    return get(base_url + '/tasks/' + user.companyID + '/' + id, null);
  }

  this.get_tasks = function() {
    return get(base_url + '/tasks/all/' + user.companyID, null);
  }

  this.delete_task = function(id) {
    return _delete(base_url + '/tasks/' + user.companyID + '/' + id);
  }

  this.update_task = function(id, name) {
    return post(base_url + '/tasks/' + user.companyID + '/' + id, {
      newName: name
    });
  }

  this.new_task = function(name, file) {
    return post_file(base_url + '/tasks/upload/' + user.companyID, {
      name: name,
      newTaskFile: file
    })
  }



}]);