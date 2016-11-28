"use strict"

var Range = require('../model/range')
var Point = require('../model/Point')

module.exports = 
{
  get: function (container, doc)
  {
    var selection = window.getSelection()
    
    if (!selection.anchorNode)
    {
      return null
    }
    
    var start_node = selection.anchorNode
    var end_node = selection.focusNode
    
    if (!is_inside_container(container, start_node) ||
      !is_inside_container(container, end_node))
    {
      return null
    }
    
    var start = get_element_point(doc.elements, container, start_node, selection.anchorOffset)
    var end = get_element_point(doc.elements, container, end_node, selection.focusOffset)
    
    if (end.index == start.index && end.offset == start.offset)
    {
      return Range.create({ start: start })
    }
    else
    {
      if (start.index > end.index || start.offset > end.offset)
      {
        var tmp = start
        start = end
        end = tmp
      }
      
      return Range.create({ start: start, end: end })
    }
  },
  
  set: function (container, doc, doc_range)
  {
    var start = get_dom_point(container, doc.elements, doc_range.start)
    
    var range = document.createRange()
    range.setStart(start.node, start.offset)
    
    if (doc_range.end)
    {
      var end = get_dom_point(container, doc.elements, doc_range.end)
      range.setEnd(end.node, end.offset)
    }
    
    var selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}


function is_inside_container (container, node)
{
  if (node == container)
  {
    return false
  }
  
  while (node.parentNode)
  {
    if (node.parentNode == container)
    {
      return true
    }
    node = node.parentNode
  }
  
  return false
}

function get_element_point (elements, container, node, offset)
{
  var element_node = node
  
  while (1)
  {
    if (element_node.parentNode == container ||
       (is_list(element_node.parentNode) && element_node.parentNode.parentNode == container))
    {
      break
    }
    
    element_node = element_node.parentNode
  }
  
  var element_index = get_element_index(container, element_node)
  
  if (-1 < element_index)
  {
    var element = elements[element_index]
    
    if (element.type == 'embed')
    {
      return get_embed_point(element_index, element, element_node, node, offset)
    }
    else
    {
      return get_text_point(element_index, element, element_node, node, offset)
    }
  }
}

function get_element_index (container, element_node)
{
  var cur_node = container.firstChild
  var i = 0
  
  while (cur_node)
  {
    if (cur_node == element_node)
    {
      return i
    }
    else if (is_list(cur_node))
    {
      if (cur_node == element_node.parentNode)
      {
        var li_node = cur_node.firstChild
        while (li_node)
        {
          if (li_node == element_node)
          {
            return i
          }
          i++
          li_node = li_node.nextSibling
        }
      }
      else
      {
        i += cur_node.childNodes.length
      }
    }
    else
    {
      i++
    }
    
    cur_node = cur_node.nextSibling
  }
  
  return -1
}

function get_text_point (index, element, root_node, sel_node, sel_offset)
{
  var offset = { value: sel_offset }
  get_text_offset(root_node, sel_node, offset)
  
  return Point.create({
    index: index,
    offset: offset.value
  })
}

function get_text_offset (root_node, sel_node, offset)
{
  var cur_child = root_node.firstChild
  
  while (cur_child)
  {
    if (cur_child == sel_node)
    {
      return false
    }
    else if (cur_child.nodeType == 3) // text
    {
      offset.value += cur_child.nodeValue.length
    }
    else if (cur_child.nodeType == 1) // element
    {
      if (!get_text_offset(cur_child, sel_node, offset))
      {
        return false
      }
    }
    
    cur_child = cur_child.nextSibling
  }
  
  return true
}

function get_embed_point (index, element, root_node, sel_node, offset)
{
  return Point.create({ index: index })
}

function get_dom_point (container, elements, doc_point)
{
  var element = elements[doc_point.index]
  var node = get_node_for_element_index(container, doc_point.index)
  
  if (element.type == 'embed')
  {
    return get_dom_point_for_embed(element, node, doc_point)
  }
  else
  {
    return get_dom_point_for_text(element, node, doc_point)
  }
}

function get_dom_point_for_text(element, node, doc_point)
{
  if (!element.annotations || element.annotations.length == 0)
  {
    return { node: node.firstChild ? node.firstChild : node, offset: doc_point.offset }
  }
  else
  {
    return get_dom_point_for_offset_in_text(node, doc_point.offset)
  }
}

function get_dom_point_for_offset_in_text (node, offset)
{
  var cur_node = node.firstChild
  
  if (offset == 0)
  {
    return { node: cur_node, offset: 0 }
  }
  
  while (cur_node)
  {
    if (cur_node.nodeType == 3) // text
    {
      if (offset <= cur_node.nodeValue.length)
      {
        return { node: cur_node, offset: offset }
      }
      else
      {
        offset -= cur_node.nodeValue.length
      }
    }
    else if (cur_node.nodeType == 1) // element
    {
      var match = get_dom_point_for_offset_in_text(cur_node, offset)
      if (match)
      {
        return match
      }
      else
      {
        offset -= cur_node.textContent.length
      }
    }
    cur_node = cur_node.nextSibling
  }
}

function get_dom_point_for_list (element, node, doc_point)
{
  if (element.elements.length == 0)
  {
    return { node: node, offset: 0 }
  }
  else
  {
    return get_dom_point(node, element.elements, doc_point.point)
  }
}

function get_dom_point_for_embed (element, node, doc_point)
{
  return { node: node, offset: 0 }
}

function is_list (node)
{
  var tag = node.tagName
  return (tag == 'UL' || tag == 'OL')
}

function get_node_for_element_index (container, index)
{
  var cur_node = container.firstChild
  var i = 0
  
  while (cur_node)
  {
    if (i == index)
    {
      if (is_list(cur_node))
      {
        return cur_node.firstChild
      }
      else
      {
        return cur_node
      }
    }
    else if (is_list(cur_node) && cur_node.firstChild)
    {
      cur_node = cur_node.firstChild
    }
    
    if (cur_node.nextSibling)
    {
      cur_node = cur_node.nextSibling
    }
    else if (cur_node.tagName == 'LI')
    {
      cur_node = cur_node.parentNode.nextSibling
    }
    
    i++
  }
}