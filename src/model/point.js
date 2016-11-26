'use strict'

module.exports = 
{
  create: function (args)
  {
    return Object.assign({ index: 0, offset: 0 }, args)
  }
}