'use strict';

describe('Factories mails test', function() {
    var factory;
    var api;
    
    beforeEach(function() {
        module('app');

        inject(function(mails, API) {
            factory = mails;
            api = API;
        })

        var notices = [
            {
                ID: 0,
                companyID: 0,
                content: "通知",
                senderName: "caocun",
                sentTime: "2017-06-21T11:45:36Z",
                title: "老总带钱跑啦！",
                fold: "read"
            },
            {
                ID: 1,
                companyID: 0,
                content: "通知",
                senderName: "caocun",
                sentTime: "2017-06-21T11:45:36Z",
                title: "老总带钱跑啦！",
                fold: "unread"
            },
            {
                ID: 2,
                companyID: 0,
                content: "通知",
                senderName: "caocun",
                sentTime: "2017-06-21T11:45:36Z",
                title: "老总带钱跑啦！",
                fold: "send"
            }
        ];



        spyOn(api, 'get_receive_notice').add.callFake(function(is_read) {
            if(is_read)
                return [notices[0]];
            else
                return [notices[1]];
        });

        spyOn(api, 'get_send_notice').add.callFake(function() {
            return [notices[2]];
        });

        spyOn(api, 'read_notice').add.callFake(function(id) {
            if(id === 1)
                notices[1].fold = "read";
            return true;
        });

        spyOn(api, 'find_notice').add.callFake(function(id) {
            if(id == notices[0].ID)
                return 0;
            else
                return 1;
        });

        spyOn(api, 'delete_received_notice').add.callFake(function(id) {
            notices.splice(id, 0);
            return true;
        });

        spyOn(api, 'delete_send_notice').add.callFake(function(id) {
            notices.splice(id, 0);
            return true;
        });

        spyOn(api, 'loading').add.callFake(function() {
            return;
        });

        spyOn(api, 'stop_loading').add.callFake(function() {
            return;
        });
    });

    it('Should have function', function() {
        expect(angular.isFunction(factory.get_mails)).toBe(true);
        expect(angular.isFunction(factory.get_detail)).toBe(true);
        expect(angular.isFunction(factory.delete_notice)).toBe(true);
    })

    it('Should get 3 mails', function() {
        var res = factory.get_mails('');
        expect(res.length).toBe(3);
    })

    it('Should get mail detail', function() {
        var res = factory.get_detail(0);

        expect(res.ID).toBe(0);
    })

    it('Should delete a notice', function() {
        factory.delete_notice(1);
        var res = factory.get_mails('');
        expect(res.length).toBe(2);
    })
})

describe("Factories tasks test", function() {
    var factory;
    var api;

    beforeEach(function() {
        module('app');

        inject(function(tasks, API) {
            factory = tasks;
            api = API;
        })

        var tasks = [
        {
            ID: 0,
            name: "请假",
            updateTime: "2017-06-21T11:45:36Z",
        }
        ];

        spyOn(api, 'get_task_detail').add.callFake(function(id) {
            if(id === 0)
                return {
                    data: "1"
                }
            else
                return {
                    info: ""
                }
        });

        spyOn(api, 'alert').add.callFake(function(text, scope, cb) {
            return;
        });

        spyOn(api, 'get_tasks').add.callFake(function() {
            return tasks;
        })

        spyOn(api, 'delete_task').add.callFake(function(id) {
            tasks.splice(id, 1);
            return {
                info: "删除成功"
            }
        })

        spyOn(api, 'update_task').add.callFake(function(id, name) {
            if(id === 0) {
                tasks[0].name = name;
            }
            return true;
        })

        spyOn(api, 'new_task').add.callFake(function(name, file) {
            return {
                body: {
                    ID: 1,
                    deploy: true,
                    upload: true,
                    data: "",
                    info: "OK"
                }
            }
        })

        it('Should have function', function() {
            expect(angular.isFunction(factory.find_task)).toBe(true);
            expect(angular.isFunction(factory.get_task_detail)).toBe(true);
            expect(angular.isFunction(factory.get_all)).toBe(true);
            expect(angular.isFunction(factory.delete_task)).toBe(true);
            expect(angular.isFunction(factory.update_task)).toBe(true);
            expect(angular.isFunction(factory.new_task)).toBe(true);
        })

        it('Should find a task', function() {
            var res = factory.find_task(0);
            expect(res.name).toBe("请假");
        })

        it('Should get task detail', function() {
            var res = factory.get_task_detail(0);
            expect(res).toBe("data:image/png;base64,1");
        })

        it('Should not get task detail', function() {
            var res = factory.get_task_detail(1);
            expect(res).toBe("");
        })

        it('Should get all tasks', function() {
            var res = factory.get_all();
            expect(res.length).toBe(1);
        })

        it('Should add a task', function() {
            var res = factory.new_task("玩耍", null);
            expect(res.name).toBe("玩耍");
        })

        it('Should delete a task', function() {
            factory.delete_task(1);
            var res = factory.get_all();
            expect(res.length).toBe(1);
        })

    })
})
