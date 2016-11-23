'use strict'

module.exports = 
{
  create: function (args)
  {
    return Object.assign({
      type: 'list',
      name: 'ul',
      attributes: {},
      text: '',
      annotations: []
    }, args)
  }
}