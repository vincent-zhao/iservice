/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.create  = function (delay, recall) {

  /**
   * @ callback functions
   */
  var callbacks = [];

  /**
   * @ emit latence timer
   */
  var timer = null;

  /**
   * @ last emit time
   */
  var mtime = 0;

  /**
   * @ current value
   */
  var cdata = null;

  var _me   = {};

  /* {{{ public function push() */
  _me.push  = function (cb) {
    if (Date.now() - mtime < (recall || 2000)) {
      cb && cb(cdata);
    }

    return callbacks.push(cb) - 1;
  };
  /* }}} */

  /* {{{ public function remove() */
  /**
   * remove callback by id
   */
  _me.remove = function (id) {
  };
  /* }}} */

  /* {{{ public function emit() */
  /**
   * To emit change event
   */
  _me.emit  = function (data) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    cdata = data;
    mtime = Date.now();
    timer = setTimeout(function () {
      callbacks.forEach(function (cb) {
        cb && cb(data);
      });
    }, (delay || 10));
  };
  /* }}} */

  return _me;
};

