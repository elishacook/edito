'use strict'

module.exports = {
  create: function (args)
  {
    return Object.assign({ type: 'embed', name: 'figure' }, args)
  }
}