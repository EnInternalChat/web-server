app.controller('MailCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.folds = [
    {name: '所有', filter: ''},
    {name: '已读', filter: 'read'},
    {name: '未读', filter: 'unread'},
    {name: '发送', filter: 'send'}
  ];

  $scope.labels = [
    {name: '程序部', filter:'read', color:'#23b7e5'},
    {name: '财政部', filter:'unread', color:'#7266ba'},
    {name: '业务部', filter:'send', color:'#fad733'}
  ];

}]);

app.controller('MailListCtrl', ['$scope', 'mails', '$stateParams', '$state', 
  function($scope, mails, $stateParams, $state) {
  $scope.fold = $stateParams.fold;

  $scope.get_mails = function() {
    mails.get_mails($scope.fold).then(function(mails) {
      $scope.mails = mails;
      $scope.$apply();
    });
  }

  $scope.refresh = function() {
    $scope.get_mails();
  }

  $scope.mail_detail = function(id) {
    $state.go('app.mail.detail', { mailID: parseInt(id) });
  }
  $scope.get_mails();
}]);

app.controller('MailDetailCtrl', ['$state', '$scope', 'mails', '$stateParams', 'API', '$sce', 
  function($state, $scope, mails, $stateParams, API, $sce) {
    $scope.mail = {};
    mails.get_detail($stateParams.mailID).then(function(mail) {
      $scope.mail = mail;
      API.loading();
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: true,
        sanitize: true,
        smartLists: true,
        smartypants: true
      });
      $scope.md_content = $sce.trustAsHtml(marked(mail.content));
      API.stop_loading();
      $scope.$apply();
    });
    $scope.delete_notice = function(id) {
      API.loading();
      mails.delete_notice(id).then(function(res) {
        API.stop_loading();
        $state.go('app.mail.list');
      })
    }
}]);

app.controller('MailNewCtrl', ['$scope', 'API',
  function($scope, API) {
  $scope.title = "";
  $scope.to_list = { data:[] };
  $scope.sections_list = [];

  $scope.markdown_editor = new SimpleMDE({ 
    element: document.getElementById('markdown-editor'),
    toolbar: [
      "bold", "italic", "strikethrough", "|", 
      "heading-1", "heading-2", "heading-3", "|", 
      "code", "quote", "unordered-list", "ordered-list", "image", "table", "|",
      "preview"] });

  $scope.tree2list = function(tree) {
    $scope.sections_list.push({
      name: tree.name,
      id: tree.ID
    })
    if(tree['childrenSections'].length === 0)
      return;
    else {
      for(var i = 0, n = tree['childrenSections'].length; i < n; i++) {
        $scope.tree2list(tree['childrenSections'][i]);
      }
    }
  }
  
  $scope.get_receive_sections = function() {
    API.loading();
    API.get_section_info(API.user_info().sectionID).then(
      function(res) {
        $scope.tree2list(res);
        API.stop_loading();
      })
  };

  $scope.send_notice = function() {
    if($scope.to_list.data.length === 0){
      API.alert('接收部门不能为空', $scope, function(){});
      return;
    }
    else if(!$scope.title || $scope.title === "") {
      API.alert('通知标题不能为空', $scope, function(){});
      return;
    }
    var receivers = [];
    $scope.to_list.data.forEach(function(item) {
      receivers.push(item.id);
    });
    API.loading();
    API.send_notice(receivers, $scope.title, $scope.markdown_editor.value()).then(
      function(res) {
        API.stop_loading();
        API.alert(res.body.info, $scope, function(){});
      })
  }

  $scope.get_receive_sections();
}]);

angular.module('app').directive('labelColor', function(){
  return function(scope, $el, attrs){
    $el.css({'color': attrs.color});
  }
});