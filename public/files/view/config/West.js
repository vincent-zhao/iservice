Ext.define('Iservice.view.config.West', {
  extend : 'Ext.tab.Panel',
  width : 400,
  defaults : {
    border : false
  },
  padding : '0 5 0 0',
  initComponent : function(){

    /*{{{ configPanel */
    var configPanel = Ext.create('Ext.panel.Panel', {
      xtype : 'panel',
      layout : {
        type : 'vbox',
        align : 'stretch',
        pack : 'start'
      },
      defaults : {
        border : false
      },
      padding : '2 2 2 2',
      items : [
        Ext.create('Ext.tree.Panel', {
          xtype : 'treepanel',
          id : 'config_tree',
          flex : 2,
          autoScroll : true,
          split : true,
          rootVisible : false,
          fields : [
            {name : 'text', type:'string'},
            {name : 'state', type:'string'}
          ],
          columns : [
            {
              xtype: 'treecolumn',
              text: 'config',
              flex: 2,
              dataIndex: 'text'
            },{
              text : 'state',
              flex : 1,
              align: 'center',
              dataIndex : 'state'
            }
          ]
        })
      ]
    });
    /*}}}*/

    /*{{{ dupPanel */
    var dupPanel = Ext.create('Ext.panel.Panel', {
      xtype : 'panel',
      layout : {
        type : 'vbox',
        align : 'stretch',
        pack : 'start'
      },
      border : false,
      padding : '2 2 2 2',
      items : [
        Ext.create('Ext.grid.Panel', {
          id : 'dupps',
          stateful: true,
          autoScroll : true,
          split : true,
          multiSelect: false,
          defaults : {
            border : false
          },

          columns : [
            {
              id : 'dup_path',
              text : 'path',
              dataIndex : 'path',
              flex : 5,
              sortable : true
            },
            {
              id : 'dup_modtime',
              text : 'modtime',
              dataIndex : 'modtime',
              flex : 4,
              sortable : true
            },
            {
              id : 'dup_type',
              text : 'type',
              dataIndex : 'node_type',
              align: 'center',
              flex : 1,
              sortable : true
            }
          ],
          tbar : [
            {
              id : 'tbar_submit_all',
              icon : '/public/extjs/resources/themes/images/access/dd/drop-yes.gif',
              text : 'submit all',
            },
          ]
        })
      ]
    });
    /*}}}*/

    this.items = [
      {
        title : 'Config Tree',
        collaspsible : true,
        layout : 'fit',
        split : true,
        items : [configPanel]
      },
      {
        title : 'Duplicates',
        collaspsible : true,
        layout : 'fit',
        split : true,
        items : [dupPanel]
      }
    ]
    this.callParent();
  }
});
