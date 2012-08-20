Ext.define('Iservice.controller.config.ConfigTree', {
  extend : 'Ext.app.Controller',
  
  view : [
    'config.East',
    'config.Main',
    'config.Menu',
    'config.West'
  ],

  /*{{{ refs */
  refs : [
    {
      ref : 'configContent',
      selector : '#content'
    },
    {
      ref : 'duplicate',
      selector : '#duplicate'
    },
    {
      ref : 'configOther',
      selector : '#other'
    },
    {
      ref : 'configTree',
      selector : '#config_tree'
    },
    {
      ref : 'dups',
      selector : '#dupps'
    },
    {
      ref : 'dupPanel',
      selector : '#duplicate_panel'
    },
    {
      ref : 'field',
      selector : '#input'
    },
  ],
  /*}}}*/

  init : function() {
    var _self = this;
    this.control({
      '#config_tree' : {
        itemclick : this.treeClick,
        itemcontextmenu : this.treeRightClick
      },
      '#dupps' : {
        itemclick : this.dupClick
      },
      '#tbar_submit_all' : {
        click : this.submitAll
      }
    });
    
    this.addListener('ok',function(){
      load();
    });

    var load = function(){
      var tree = _self.getConfigTree();
      var duplicates = _self.getDups();

      var count = 2;
      _self.result = {};
      
      /*{{{ ajax -> configtree */
      Ext.Ajax.request({
        url : 'view/configtree',
        method : 'GET',
        success : function(res){
          var data = JSON.parse(res.responseText);
          if (data.message !== '') {
            alert('get configtree error');
          } else {
            _self.result.tree = data.data;
            if (--count === 0) {
              render();
            }
          }
        }
      });
      /*}}}*/

      /*{{{ ajax -> getdups */
      Ext.Ajax.request({
        url : 'edit/getdups',
        method : 'GET',
        success : function(res){
          var data = JSON.parse(res.responseText);
          if (data.message !== '') {
            alert('get dups error');
          } else {
            _self.result.dups = data.data;
            if (--count === 0) {
              render();
            }
          }
        }
      });  
      /*}}}*/

      /*{{{ generateMap() */
      var generateMap = function(){
        _self.map = {};
        var stack = [];
        stack.push(_self.result.tree);
        while (stack.length !== 0) {
          var node = stack.pop();
          _self.map[node.id] = node;
          for (var i in node['children']) {
            stack.push(node['children'][i]);
          }
        }
      }
      /*}}}*/

      /*{{{ render() */
      var render = function () {
        var dupMap = {}
        var dupObjMap = {};
        for (var i in _self.result.dups) {
          dupMap[_self.result.dups[i].path] = true;
          dupObjMap[_self.result.dups[i].path] = _self.result.dups[i];
        }

        var stack = [];
        stack.push(_self.result.tree);
        while (stack.length !== 0) {
          var node = stack.pop();
          if (dupMap[node.id]) {
            node.state = 'M';
            dupMap[node.id] = false;
          }
          for (var i in node['children']) {
            stack.push(node['children'][i]);
          }
        }

        var arr = [];
        for (var i in dupMap) {
          if (dupMap[i]) {
            arr.push(i);
          }
        }

        arr.sort(function (a, b){
          return a > b;
        });

        for (var i = 0; i < arr.length; i++) {
          var splits = arr[i].split('/');
          splits.shift();

          var path = '/';
          var obj = _self.result.tree;
          var word = '';
          while (true) {
            word = splits.shift();
            path = path + word;
            var exist = false;
            for (var j in obj.children) {
              if (obj.children[j].id === path) {
                path = path + '/';
                obj = obj.children[j];
                exist = true;
                break;
              }
            }
            if (!exist) {
              if (obj.children === undefined) {
                obj.children = [];
                delete obj.leaf;
              }
              obj.children.push({
                'text' : word,
                'id'   : path,
                'state': 'A',
                'leaf' : dupObjMap[arr[i]].node_type === 'F' 
              });
              break;
            }
          }
        }

        generateMap();
        tree.setRootNode(_self.result.tree);
        duplicates.getStore().loadData(_self.result.dups);
      }
      /*}}}*/

    };
  },

  /*{{{ treeClick() */
  treeClick : function(ms, record) {
    var _self = this;

    if (!record.data.leaf) {
      return;
    }

    var content = _self.getConfigContent();
    var duplicate = _self.getDuplicate();
    var other = _self.getConfigOther();
    var dupPanel = _self.getDupPanel();
    
    /*{{{ show dup() */
    var showDup = function(){
      for (var i = 0; i < _self.result.dups.length; i++) {
        if (_self.result.dups[i].path === record.data.id) {
          duplicate.setRawValue(_self.result.dups[i].content);
          dupPanel.setTitle('Edit space (' + _self.result.dups[i].path + ')');
        }
      }
    }
    /*}}}*/

    /*{{{ query() */
    var query = function(){
      Ext.Ajax.request({
        url : 'view/configcontent',
        method : 'POST',
        jsonData : {
          path : record.data.id
        },
        success : function (res) {
          var data = JSON.parse(res.responseText);
          if (data.message !== '') {
            alert('get config content error');
          } else {
            content.update(data.content);
            other.update(data.elseinfo);
          }
        }
      });
    }
    /*}}}*/

    if (record.data.state === 'A') {
      showDup();
      dupPanel.setVisible(true);
      content.setVisible(false);
    } else if (record.data.state === 'M') {
      showDup();
      query();
      dupPanel.setVisible(true);
      content.setVisible(true);
    } else {
      query();
      dupPanel.setVisible(false);
      content.setVisible(true);
    }
  },
  /*}}}*/

  /*{{{ treeRightClick() */
  treeRightClick : function(ms, record, item, index, e){
    var _self = this;
    e.preventDefault();
    var ava = {
      'CREATE FOLDER' : 1,
      'CREATE DUPLICATE' : 2,
      'DELETE DUPLICATE' : 4
    }
    var menu = Ext.create('Iservice.view.config.Menu');

    var set = function(num){
      for (var i in menu.items.items) {
        if (num & ava[menu.items.items[i].text.toUpperCase()]) {
          menu.items.items[i].setDisabled(false);
        }
      }
    }

    if (record.data.leaf) {
      if (record.data.state) {
        set(ava['DELETE DUPLICATE']);
      } else {
        set(ava['CREATE DUPLICATE']);
      }
    } else {
      if (record.data.state && (record.data.children === undefined || (record.data.children && record.data.children.length === 0))){
        set(ava['DELETE DUPLICATE']);
      }
      set(ava['CREATE FOLDER']);
      set(ava['CREATE DUPLICATE']);
    }

    menu.showAt(e.getXY());

    /*{{{ send() */
    var send = function(path, type){
      Ext.Ajax.request({
        url : 'edit/createdup',
        method : 'POST',
        jsonData : {
          path : path,
          type : type
        },
        success : function (res) {
          var ret = JSON.parse(res.responseText);
            if (ret.message === '') {
            alert('created!');
            location.reload();
          } else {
            alert('failed: ' + ret.message);
          }
        }
      });
    }
    /*}}}*/

    /*{{{ showWindow() */
    var showWindow = function(which){
      var win = Ext.create('Ext.window.Window', {
        title : 'Edit Window',
        autoShow : true,
        items : [{
          xtype: 'form',
          bodyPadding: 5,
          
          fieldDefaults : {
            labelAlign: 'left',
            labelWidth: 50,
            anchor: '100%'
          },
          
          items : [{
            xtype: 'textfield',
            name : 'name',
            fieldLabel: 'Name',
            id : 'input'
          }],

          buttons : [{
            text: 'OK',
            handler : function(){
              var name = _self.getField().lastValue;
              var path = record.data.id + '/' + name;
              var type = which;
              send(path, type);
            }
          },{
            text: 'Cancel',
            scope: this,
            handler: function(){
              win.close();
            }
          }]
        }]
      });
      win.show();
    }
    /*}}}*/

    menu.on('click', function (menu, item, e, eopts) {
      if (item.text === 'create folder') {
        showWindow('D');
      } else if (item.text === 'create duplicate') {
        if (record.data.leaf) {
          send(record.data.id, 'F');
        } else {
          showWindow('F');
        }
      } else if (item.text === 'delete duplicate') {
        if (window.confirm('delete dup:\'' + record.data.id + '\'')) {
          Ext.Ajax.request({
            url : 'edit/deletedup',
            method : 'POST',
            jsonData : {
              path : record.data.id,
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
  },
  /*}}}*/

  dupClick : function(ms, record) {
    this.treeClick(null, {data:this.map[record.data.path]});
  },

  /*{{{ submitAll() */
  submitAll : function(){
    if (window.confirm('submit all dups ?')) {
      Ext.Ajax.request({
        url : 'submit/createtask',
        method : 'GET',
        success : function (res) {
          var ret = JSON.parse(res.responseText);
          if (ret.message === '') {
            alert('submit all!');
            location.reload();
          } else {
            alert('failed: ' + ret.message);
          }
        }
      });
    }
  }
  /*}}}*/

});
