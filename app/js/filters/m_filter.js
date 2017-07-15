'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app')
  .filter('fromNow', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  })
  .filter('section_filter',function(){
    return function(items, id){
        var array = [];
        for(var i = 0, n = items.length; i < n; i++) {
          if(items[i]['group_id'] === id)
            array.push(items[i]);
        }
        return array;
    }
});