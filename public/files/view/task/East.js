Ext.define('Iservice.view.task.East', {
  extend : 'Ext.panel.Panel',
  layout : 'border',
  padding : '0 5 0 0',
  collapsible : false,

  initComponent : function(){
    var north = Ext.create('Ext.grid.Panel', {
      title : 'duplicates',
      id : 'task_dup_panel',
      collapsible : true,
      autoScroll : true,
      flex : 1,
      region : 'north',
      padding : '0 3 0 0',
      store  : Ext.create('Ext.data.ArrayStore',{
        fields : ['path','modtime','node_type']
      }),
      columns : [
        {
          text : 'path',
          dataIndex : 'path',
          flex : 5,
          sortable : true
        },
        {
          text : 'modtime',
          dataIndex : 'modtime',
          flex : 4,
          sortable : true
        },
        {
          text : 'type',
          dataIndex : 'node_type',
          flex : 1,
          sortable : true
        }
      ],
    });

    var center = Ext.create('Ext.panel.Panel', {
      title : 'content',
      id : 'task_dup_content',
      collapsible : true,
      flex : 2,
      region : 'center',
      padding : '2 2 2 2'
    });

    this.items = [north, center];
    this.callParent();
  }

});
