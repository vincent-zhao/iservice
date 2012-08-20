Ext.define('Iservice.controller.config.EditPanel', {
  extend : 'Ext.app.Controller',

  refs : [
    {
      ref : 'editArea',
      selector : '#duplicate'
    },
    {
      ref : 'edit',
      selector : '#editbar_edit'
    },
    {
      ref : 'space',
      selector : '#duplicate_panel'
    }
  ],

  init : function() {
    this.control({
      '#editbar_edit' : {
        click : this.enableEdit
      },
      '#editbar_save' : {
        click : this.saveDup
      },
      '#editbar_delete' : {
        click : this.deleteDup
      }
    });
  },

  enableEdit : function() {
    this.getEditArea().setReadOnly(!this.getEditArea().readOnly);
    this.getEdit().toggle();
  },

  saveDup : function() {
    var path = this.getSpace().getHeader().title.split('(').pop().split(')').shift();
    Ext.Ajax.request({
      url : 'edit/savedup',
      method : 'POST',
      jsonData : {
        path : path,
        content : this.getEditArea().getRawValue()
      },
      success : function (res) {
      var ret = JSON.parse(res.responseText);
        if (ret.message === '') {
        alert('saved!');
          location.reload();
        } else {
          alert('failed: ' + ret.message);
        }
      }
    });
  },

  deleteDup : function() {
    var path = this.getSpace().getHeader().title.split('(').pop().split(')').shift();
    if (window.confirm('delete dup:\'' + path + '\'')) {
      Ext.Ajax.request({
        url : 'edit/deletedup',
        method : 'POST',
        jsonData : {
          path : path,
        },
        success : function (res) {
        var ret = JSON.parse(res.responseText);
          if (ret.message === '') {
            alert('deleted!');
            location.reload();
          } else {
            alert('failed: ' + ret.message);
          }
        }
      });
    }
  }

});
