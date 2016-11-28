'use strict'

var splice = require('../util/splice')
var Range = require('../model/range')
var Point = require('../model/point')
var Text = require('../model/text')

module.exports = function (document, selection)
{
  if (Range.is_collapsed(selection) && !selection.start.offset)
  {
    // A backspace at the very beginning of the first element
    // doesn't do anything
    if (selection.start.index == 0)
    {
      return 
    }
    
    return backspace_at_beginning(document, selection)
  }
  else
  {
    return remove_selection (document, selection)
  }
}

function backspace_at_beginning (document, selection)
{
  var cur_element = document.elements[selection.start.index]
  var prev_element = document.elements[selection.start.index - 1]
  
  // List items turn into paragraphs
  if (cur_element.type == 'list')
  {
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index,
          1,
          Text.create({
            text: cur_element.text,
            annotations: cur_element.annotations
          })
        )
      }),
      selection: selection
    }
  }
  // We can't merge embeds so they get removed
  else if (prev_element.type == 'embed')
  {
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index - 1,
          1
        )
      }),
      selection: Object.assign({}, selection, {
        start: Point.create({ index: selection.start.index - 1 })
      })
    }
  }
  
  else if (cur_element.type == 'embed')
  {
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index,
          1
        )
      }),
      selection: Object.assign({}, selection, {
        start: Point.create({ index: selection.start.index - 1 })
      })
    }
  }
  // Adjacent text elements are merged
  else
  {
    return {
      document: Object.assign({}, document, {
        elements: splice(
          document.elements,
          selection.start.index - 1,
          2,
          merge_text_elements(prev_element, cur_element)
        ) 
      }),
      selection: Object.assign({}, selection, {
        start: Point.create({
          index: selection.start.index - 1,
          offset: prev_element.text.length
        })
      })
    }
  }
}

function merge_text_elements (a, b)
{
  var a_text_length = a.text.length
  return Object.assign({}, a, {
    text: a.text + b.text,
    annotations: a.annotations.concat(
      b.annotations.map(function (x) {
        return Object.assign({}, x, { offset: x.offset + a_text_length })
      })
    )
  })
}

function remove_selection (document, selection)
{
  if (Range.spans_multiple_elements(selection))
  {
    return remove_multiple_selection(document, selection)
  }
  else
  {
    return remove_single_selection(document, selection)
  }
  
}

function remove_multiple_selection (document, selection)
{
  var start_element = document.elements[selection.start.index]
  var end_element = document.elements[selection.end.index]
  var replacement_element
  
  if (start_element.type != 'embed')
  {
    replacement_element = Text.cut(start_element, selection.start.offset, start_element.text.length)
  }
  
  if (end_element.type != 'embed')
  {
    var new_end_element = Text.cut(end_element, 0, selection.end.offset)
    if (new_end_element.text.length > 0)
    {
      if (replacement_element)
      {
        replacement_element = merge_text_elements(replacement_element, new_end_element)
      }
      else
      {
        replacement_element = new_end_element
      }
    }
  }
  
  var args = [
    document.elements, 
    selection.start.index, 
    selection.end.index - selection.start.index + 1
  ]
  
  if (replacement_element)
  {
    args.push(replacement_element)
  }
  
  return {
    document: Object.assign({}, document, {
      elements: splice.apply(null, args)
    }),
    selection: Object.assign({}, selection, {
      start: selection.start,
      end: null
    })
  }
}


function remove_single_selection (document, selection)
{
  return {
    document: Object.assign({}, document, {
      elements: splice(
        document.elements,
        selection.start.index,
        1,
        Text.cut(document.elements[selection.start.index], selection.start.offset, selection.end.offset)
      )
    }),
    selection: Object.assign({}, selection, {
      start: selection.start,
      end: null
    })
  }
}