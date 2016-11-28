'use strict'

var splice = require('../util/splice')

module.exports = function (document, selection, element_update)
{
  var end_index = selection.end ? selection.end.index : selection.start.index
  var selected_elements = document.elements.slice(selection.start.index, end_index + 1)
  var splice_args = [
    document.elements,
    selection.start.index,
    selected_elements.length
  ].concat(
    selected_elements.map(function (x)
    {
      return Object.assign({}, x, element_update)
    })
  )
  
  return {
    document: Object.assign({}, document, {
      elements: splice.apply(null, splice_args)
    }),
    selection: selection
  }
}