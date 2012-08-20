Ext.define('Iservice.controller.ModuleChoose', {
  extend : 'Ext.app.Controller',

  refs: [
    {
      ref : 'main',
      selector : '#main_panel'
    },
    {
      ref : 'mainview',
      selector : '#main_view'
    }
  ],

  init : function() {
    this.control({
      'modulechoose button' : {
        click : this.changeModule
      }
    });
  },

  changeModule : function(button) {
    if (button.action === 'config') {
      var panel = this.getMainview();
      panel.removeAll();
      panel.add(Ext.create('Iservice.view.config.Main'));
      this.getController('config.ConfigTree').fireEvent('ok');;
    
    } else if (button.action === 'task') {
      var panel = this.getMainview();
      panel.removeAll();
      panel.add(Ext.create('Iservice.view.task.Main'));
      this.getController('task.Task').fireEvent('ok');;

    }
  }
});
