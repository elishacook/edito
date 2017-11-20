'use strict'

var Annotation = require('../model/annotation')
var Range = require('../model/range')
var splice = require('../util/splice')

module.exports = function (document, selection, annotation)
{
  if (!selection || Range.is_collapsed(selection))
  {
    return
  }
  
  var annotation = Object.assign({}, annotation, { name: Annotation.get_canonical_name(annotation.name) })
  var selected_elements = Range.get_selected_elements(selection, document)
  
  if (Range.has_continuous_annotation(selection, selected_elements, annotation))
  {
    return turn_off(document, selection, selected_elements, annotation)
  }
  else
  {
    return turn_on(document, selection, selected_elements, annotation)
  }
}

function turn_on (document, selection, selected_elements, annotation)
{
  var splice_args = [
    document.elements,
    selection.start.index,
    selected_elements.length,
  ].concat(
    selected_elements.map(function (element, i)
    {
      var start = i == 0 ? selection.start.offset : 0
      var end = i == selected_elements.length - 1 ? selection.end.offset : element.text.length
      
      return Object.assign({}, element, {
        annotations: Annotation.merge_similar(
          element.annotations.concat([
            Object.assign({}, annotation, { offset: start, length: end - start })
          ])
        )
      })
    })
  )
  
  return {
    document: Object.assign({}, document, {
      elements: splice.apply(null, splice_args)
    }),
    selection: selection
  }
}

function turn_off (document, selection, selected_elements, annotation)
{
  var splice_args = [
    document.elements,
    selection.start.index,
    selected_elements.length,
  ].concat(
    selected_elements.map(function (element, i)
    {
      var start = i == 0 ? selection.start.offset : 0
      var end = i == selected_elements.length - 1 ? selection.end.offset : element.text.length
      
      return Object.assign({}, element, {
        annotations: Annotation.clear_range(element.annotations, start, end, annotation)
      })
    })
  )
  
  return {
    document: Object.assign({}, document, {
      elements: splice.apply(null, splice_args)
    }),
    selection: selection
  }
}