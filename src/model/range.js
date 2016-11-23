'use strict'

module.exports = 
{
  create: function (args)
  {
    return Object.assign({
      start: null,
      end: null
    }, args)
  },
  
  is_collapsed: function (range)
  {
    return range.end == null
  },
  
  spans_multiple_elements: function (range)
  {
    return (range.end != null && range.start.index != range.end.index)
  }
}