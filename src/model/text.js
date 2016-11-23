'use strict'

module.exports = 
{
  create: function (args)
  {
    return Object.assign({
      type: 'text',
      name: 'p',
      attributes: {},
      text: '',
      annotations: []
    }, args)
  }
}