Ext.define('Iservice.view.config.Main', {
  extend : 'Ext.panel.Panel',
  layout : 'border',

  initComponent : function() {
    var northPanel = Ext.create('Iservice.view.ModuleChoose', {
      region : 'north'
    });

    var westPanel = Ext.create('Iservice.view.config.West', {
      region : 'west',
      flex : 2,
    });

    var centerPanel = Ext.create('Iservice.view.config.East', {
      region : 'center',
      flex : 5,
    });

    this.items = [northPanel, westPanel, centerPanel];
    this.callParent();
  }
  
});
