Ext.define('Iservice.view.task.Main', {
  extend : 'Ext.panel.Panel',
  layout : 'border',

  initComponent : function() {
    var northPanel = Ext.create('Iservice.view.ModuleChoose', {
      region : 'north'
    });

    var westPanel = Ext.create('Iservice.view.task.West', {
      region : 'west',
      flex : 4,
    });

    var eastPanel = Ext.create('Iservice.view.task.East', {
      region : 'center',
      flex : 6,
    });

    this.items = [northPanel, westPanel, eastPanel];
    this.callParent();
  }
  
});
