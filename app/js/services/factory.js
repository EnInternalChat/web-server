angular.module('Factories', [])
.factory('mails', ['API', function(API){
  var mails = [];

  var get_read_notice = function() {
    return API.get_receive_notice(true).then(function(res) {
      res.forEach(function(item) {
        item['fold'] = 'read';
      });
      mails = mails.concat(res);
      return true; 
    });
  }
  var get_unread_notice = function() {
    return API.get_receive_notice(false).then(function(res) {
      res.forEach(function(item) {
        item['fold'] = 'unread';
      })
      mails = mails.concat(res);
      return true;
    });
  }
  var get_send_notice = function() {
    return API.get_send_notice().then(function(res) {
      res.forEach(function(item) {
        item['fold'] = 'send';
      });
      mails = mails.concat(res);
      return true;
    });
  }

  var find_notice = function(id) {
    for(var i = 0, n = mails.length; i < n; i++) {
      if(mails[i].ID === parseInt(id)) {
        break;
      }
    }
    return i % mails.length;
  }

  var factory = {};
  factory.get_mails = function (tag) {
    mails = [];
    if(tag === '') {
      API.loading();
      return Promise.all([
        get_read_notice(), 
        get_unread_notice(), 
        get_send_notice()]).then(function(res) {
        API.stop_loading();
        return mails;
      })
    }
    else if(tag === 'read') {
      API.loading();
      return Promise.all([get_read_notice()]).then(function(res) {
        API.stop_loading();
        return mails;
      })
    }
    else if(tag === 'unread') {
      API.loading();
      return Promise.all([get_unread_notice()]).then(function(res) {
        API.stop_loading();
        return mails;
      })
    }
    else {
      API.loading();
      return Promise.all([get_send_notice()]).then(function(res) {
        API.stop_loading();
        return mails;
      })
    }
  };
  factory.get_detail = function (id) {
    var i = find_notice(id);
    if(mails[i].fold === 'unread') {
      return API.read_notice(mails[i].ID).then(function(res) {
        console.log(res);
        mails[i].fold = 'read';
        return mails[i];
      });      
    }
    else {
      return Promise.resolve(mails[i]);
    }
  };
  factory.delete_notice = function(id) {
    var i = find_notice(id);
    if(mails[i].fold === 'read' || mails[i].fold === 'unread') {
      return API.delete_received_notice(id).then(function(res) {
        return res;
      })
    }
    else {
      return API.delete_send_notice(id).then(function(res) {
        return res;
      })
    }
  }
  return factory;
}])
.factory('tasks', ['API', function(API){
  var tasks = [];
  var factory = {};
  var find_task_index = function(id) {
    for(var i = 0, n = tasks.length; i < n; i++) {
      if(tasks[i].id === parseInt(id))
        break;
    }
    return i;
  }
  factory.find_task = function(id) {
    return tasks[find_task_index(id)];
  }
  factory.get_task_detail = function(id) {
    return API.get_task_detail(id).then(function(res) {
      if(res.data) {
        tasks[find_task_index(id)].img_data = "data:image/png;base64," + res.data;
        return "data:image/png;base64," + res.data;
      }
      else {
        API.alert(res.info, null, function(){});
        return "";
      }
    });
  }
  factory.get_all = function() {
    return API.get_tasks().then(function(res) {
      tasks.splice(0, tasks.length);
      res.forEach(function(item) {
        tasks.push({
          id: item.ID,
          name: item.name,
          time: item.updateTime
        })
      })
      return tasks; 
    })
  }
  factory.delete_task = function(id) {
    return API.delete_task(id).then(function(res) {
      console.log(res);
      if(res.info === '删除成功') {
        tasks.splice(find_task_index(id), 1);
        return true;
      }
      else 
        return false;
    })
  }
  factory.update_task = function(id, name) {
    return API.update_task(id, name).then(function(res) {

    })
  }
  factory.new_task = function(name, file) {
    return API.new_task(name, file).then(function(res) {
      if(res.body.deploy && res.body.upload) {
        var new_task = {
          id: res.body.ID,
          name: name,
          img_data: "data:image/png;base64," + res.body.data,
          time: new Date()          
        }
        tasks.push(new_task);
        return new_task;
      }
      API.alert(res.body.info, null, function(){});
    })
  }
  return factory;
}])