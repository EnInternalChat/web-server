app.controller('FileUploadCtrl', ['$scope', 'FileUploader', 'tasks', 'API', 
    function($scope, FileUploader, tasks, API) {
    $scope.is_editing = false;
    $scope.is_creating = false;
    $scope.img_data;
    $scope.tasks;
    $scope.item = {};

    $scope.choose_task = function(id) {
        $scope.is_editing = false;
        $scope.is_creating = false;
        tasks.get_task_detail(id).then(function(data) {
            $scope.img_data = data;
        })
    }

    $scope.edit_task = function(id) {
        $scope.is_editing = true;
        $scope.item = tasks.find_task(id);
        $scope.img_data = $scope.item.img_data;
        if(!$scope.img_data) {
            tasks.get_task_detail(id).then(function(res) {
                $scope.img_data = res;
            });
        }
    }

    $scope.update_task = function() {
        if(!$scope.item.name || $scope.item.name == "") {
            API.alert("名字不能为空");
            return;
        }
        if($scope.is_creating) {
            API.loading();
            var file = $scope.myFile;
            tasks.new_task($scope.item.name, file).then(function(res) {
                if(res) {
                    $scope.img_data = res.img_data;
                    $scope.is_creating = false;
                }
                API.stop_loading();
            });            
        }
        else if($scope.is_editing) {
            API.loading();
            tasks.update_task($scope.item.id, $scope.item.name).then(function(res) {
                $scope.is_editing = false;
                API.stop_loading();
            });
        }
    }

    $scope.new_task = function() {
        $scope.is_creating = true;
        $scope.is_editing = false;
        $scope.item = {};
        $scope.img_data = undefined;
    }

    $scope.delete_task = function(id) {
        API.loading();
        tasks.delete_task(id).then(function(res) {
            if(res) {
                $scope.item = {};
                $scope.is_editing = false;
                $scope.is_creating = false;
                $scope.img_data = undefined;
            }
            API.stop_loading();
        })
    }

    tasks.get_all().then(function(tasks) {
        $scope.tasks = tasks;
    })


    // var uploader = $scope.uploader = new FileUploader({
    //     url: 'js/controllers/upload.php'
    // });

    // // FILTERS

    // uploader.filters.push({
    //     name: 'customFilter',
    //     fn: function(item /*{File|FileLikeObject}*/, options) {
    //         return this.queue.length < 10;
    //     }
    // });

    // // CALLBACKS

    // uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
    //     console.info('onWhenAddingFileFailed', item, filter, options);
    // };
    // uploader.onAfterAddingFile = function(fileItem) {
    //     console.info('onAfterAddingFile', fileItem);
    // };
    // uploader.onAfterAddingAll = function(addedFileItems) {
    //     console.info('onAfterAddingAll', addedFileItems);
    // };
    // uploader.onBeforeUploadItem = function(item) {
    //     console.info('onBeforeUploadItem', item);
    // };
    // uploader.onProgressItem = function(fileItem, progress) {
    //     console.info('onProgressItem', fileItem, progress);
    // };
    // uploader.onProgressAll = function(progress) {
    //     console.info('onProgressAll', progress);
    // };
    // uploader.onSuccessItem = function(fileItem, response, status, headers) {
    //     console.info('onSuccessItem', fileItem, response, status, headers);
    // };
    // uploader.onErrorItem = function(fileItem, response, status, headers) {
    //     console.info('onErrorItem', fileItem, response, status, headers);
    // };
    // uploader.onCancelItem = function(fileItem, response, status, headers) {
    //     console.info('onCancelItem', fileItem, response, status, headers);
    // };
    // uploader.onCompleteItem = function(fileItem, response, status, headers) {
    //     console.info('onCompleteItem', fileItem, response, status, headers);
    // };
    // uploader.onCompleteAll = function() {
    //     console.info('onCompleteAll');
    // };
}]);
app.directive('file', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var file = event.target.files[0];
                scope.file = file ? file : undefined;
                scope.$apply();
            });
        }
    };
});