Ext.define('Iservice.view.task.West', {
  extend : 'Ext.panel.Panel',
  layout : 'border',
  padding : '0 5 0 0',
  initComponent : function(){
    var center = Ext.create('Ext.grid.Panel',  {
      title : 'Tasks',
      id : 'task_panel',
      autoScroll : true,
      multiSelect: false,
      collapsible : false,
      region : 'center',
      store  : Ext.create('Ext.data.ArrayStore',{
        fields : ['taskid','addtime','checktime','adminid','state']
      }),

      columns : [
        {
          text : 'taskId',
          dataIndex : 'taskid',
          flex : 1,
          sortable : true
        },
        {
          text : 'addtime',
          dataIndex : 'addtime',
          flex : 3,
          sortable : true
        },
        {
          text : 'checktime',
          dataIndex : 'checktime',
          flex : 3,
          sortable : true
        },
        {
          text : 'admin',
          dataIndex : 'adminid',
          flex : 2,
          sortable : false
        },
        {
          text : 'state',
          dataIndex : 'state',
          flex : 2,
          sortable : true
        }
      ],
    });
    this.items = [center];
    this.callParent();
  }
});
