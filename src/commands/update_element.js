'use strict'

var splice = require('../util/splice')
var Range = require('../model/range')

module.exports = function (document, selection, element_update)
{
  if (!selection)
  {
    return
  }
  
  var selected_elements = Range.get_selected_elements(selection, document)
  
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