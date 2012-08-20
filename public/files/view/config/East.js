Ext.define('Iservice.view.config.East', {
  extend : 'Ext.panel.Panel',
  layout : 'border',
  padding : '0 5 0 0',
  collapsible : false,
  initComponent : function(){
    var west = Ext.create('Ext.panel.Panel', {
      title : 'config content',
      id : 'content',
      collapsible : true,
      flex : 2,
      region : 'west',
      padding : '0 3 0 0',
    });

    var center = Ext.create('Ext.panel.Panel', {
      region : 'center',
      hidden : true,
      flex : 2
    });

    /*{{{ east */
    var east = Ext.create('Ext.panel.Panel', {
      id : 'duplicate_panel',
      path : '',
      title : 'duplicate',
      collapsible : true,
      hidden : true,
      flex : 2.3,
      layout : 'border',
      region : 'east',
      rbar : [
        {
          id : 'editbar_edit',
          text : 'edit',
        },
        '-',
        {
          id : 'editbar_save',
          text : 'save',
        },
        '-',
        {
          id : 'editbar_delete',
          text : 'delete',
        }
      ],
      items : [{
        id : 'duplicate',
        xtype: 'textareafield',
        value: '',
        autoScroll : true,
        readOnly : true,
        region : 'center',
      }]
    });
    /*}}}*/

    var south = Ext.create('Ext.panel.Panel', {
      title : 'other',
      id : 'other',
      flex : 1,
      region : 'south',
    });

    this.items = [west, center, east, south]
    this.callParent();
  }
});

