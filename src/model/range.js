'use strict'

module.exports = 
{
  create: function (args)
  {
    var range = Object.assign({
      start: null,
      end: null
    }, args)
    
    if (range.start && range.end && range.start.index > range.end.index)
    {
      var tmp = range.start
      range.start = range.end
      range.end = tmp
    }
    
    return range
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