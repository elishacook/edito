'use strict'

module.exports = 
{
  text: function (args)
  {
    return Object.assign({ index: 0, offset: 0 }, args)
  },
  
  embed: function (args)
  {
    return Object.assign({ index: 0 }, args)
  },
  
  list: function (args)
  {
    return Object.assign({ index: 0, point: null }, args)
  }
}