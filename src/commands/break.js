'use strict'

var splice = require('../util/splice')
var Range = require('../model/range')
var Point = require('../model/point')
var Text = require('../model/text')
var backspace = require('./backspace')

module.exports = function (document, selection)
{
  if (!Range.is_collapsed(selection))
  {
    var result = backspace(document, selection)
    document = result.document
    selection = result.selection
  }
  
  var element = document.elements[selection.start.index]
  
  if (element.type == 'embed' || selection.start.offset == element.text.length)
  {
    return break_at_end(document, selection, element)
  }
  else
  {
    return break_in_middle(document, selection, element)
  }
}

function break_at_end (document, selection, element)
{
  if (element.type == 'list' && element.text.length == 0)
  {
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index,
          1,
          Text.create()
        )
      }),
      selection: Object.assign({}, selection, {
        start: Point.create({
          index: selection.start.index
        })
      })
    }
  }
  else
  {
    var new_element
    
    if (element.type == 'list')
    {
      new_element = Object.assign({}, element, { text: '' })
    }
    else
    {
      new_element = Text.create()
    }
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index + 1,
          0,
          new_element
        )
      }),
      selection: Object.assign({}, selection, {
        start: Point.create({
          index: selection.start.index + 1
        })
      })
    }
  }
}

function break_in_middle (document, selection, element)
{
  return {
    document: Object.assign({}, document, {
      elements: splice(
        document.elements,
        selection.start.index,
        1,
        Text.cut(element, selection.start.offset, element.text.length),
        Text.cut(element, 0, selection.start.offset)
      )
    }),
    selection: Object.assign({
      start: Point.create({
        index: selection.start.index + 1,
        offset: 0
      })
    })
  }
}