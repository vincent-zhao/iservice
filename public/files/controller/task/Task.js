Ext.define('Iservice.controller.task.Task', {
  extend : 'Ext.app.Controller',

  view : [
    'task.East',
    'task.Main',
    'task.West'
  ],

  refs : [{
    ref : 'taskPanel',
    selector : '#task_panel'
  },{
    ref : 'taskDupPanel',
    selector : '#task_dup_panel'
  },{
    ref : 'taskDupContent',
    selector : '#task_dup_content'
  }],

  init : function(){
    this.control({
      '#task_panel' : {
        itemclick : this.taskClick
      },
      '#task_dup_panel' : {
        itemclick : this.dupClick
      }
    });
  
    this.addListener('ok',function(){
      load();
    });

    var _self = this;
    var load = function(){
      Ext.Ajax.request({
        url : 'task/gettasks',
        method : 'GET',
        success : function(res){
          var data = JSON.parse(res.responseText);
          if (data.message !== '') {
            alert('get tasks error');
          } else {
            _self.getTaskPanel().getStore().loadData(data.data);
          }
        }
      });
    }
  },

  taskClick : function(ms, record) {
    var _self = this;
    Ext.Ajax.request({
      url : 'task/gettaskdups',
      method : 'POSt',
      jsonData : {
        version : record.data.version
      },
      success : function(res){
        var data = JSON.parse(res.responseText);
        if (data.message !== '') {
          alert('get task dups error');
        } else {
          _self.getTaskDupPanel().getStore().loadData(data.data);
        }
      }

    });
  },

  dupClick : function(ms, record) {
    this.getTaskDupContent().update(record.data.content);
  }

});
