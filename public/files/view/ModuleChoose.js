Ext.define('Iservice.view.ModuleChoose', {
  extend : 'Ext.panel.Panel',
  alias : 'widget.modulechoose',
  split : true,
  defaults : {
    border : false
  },
  bbar : [
    {
      text : 'Config Board',
      action : 'config'
    },
    '|',
    {
      text : 'Task Board',
      action : 'task'
    },
  ]
});
