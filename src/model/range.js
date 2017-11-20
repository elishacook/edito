'use strict'

var Annotation = require('./annotation')

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
  },
  
  get_selected_elements: function (range, document)
  {
    var end_index = range.end ? range.end.index : range.start.index
    return document.elements.slice(range.start.index, end_index + 1)
  },

  has_continuous_annotation: function (selection, selected_elements, annotation)
  {
    const protoann = { name: Annotation.get_canonical_name(annotation.name) }
    if (selection.end)
    {
      return selected_elements.every(function (element, i)
      {
        var start = i == 0 ? selection.start.offset : 0
        var end = i == selected_elements.length-1 ? selection.end.offset : element.text.length
        return Annotation.is_continuous(element.annotations, protoann, start, end)
      })
    }
    else
    {
      return Annotation.is_continuous(
        selected_elements[0].annotations,
        protoann,
        selection.start.offset,
        selection.start.offset+1
      )
    }
  }
}