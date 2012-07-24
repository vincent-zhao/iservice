/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.create = function (name, message) {
  if (!(message instanceof Error)) {
    message = new Error(message);
  }
  message.name = name || 'Unknown';

  return message;
};
