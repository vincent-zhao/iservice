Ext.onReady(function(){

  Ext.Loader.setConfig({enabled:true});

  Ext.application({

    name: 'Iservice',

    appFolder: 'public/files',

    controllers : [
      'ModuleChoose',
      'config.ConfigTree',
      'config.EditPanel',
      'task.Task'
    ],

    launch: function() {
      var main = Ext.create('Iservice.view.config.Main');

      Ext.create('Ext.container.Viewport', {
        layout : 'fit',
        id : 'main_view',
        items : [main]
      });

      this.getController('config.ConfigTree').fireEvent('ok');

    }
  });
});
