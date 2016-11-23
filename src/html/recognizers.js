'use strict'

var model = require('../model')

var allowed_block_elements = [
  'p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'li'
]

var allowed_inline_elements = [
  'a', 'b', 'strong', 'i', 'em', 'u', 'strikethru'
]

module.exports = [
  oembed,
  figure,
  list,
  text
]


function oembed (node)
{
  if (node.className == 'oembed')
  {
    return model.embed.create({
      name: 'oembed',
      html: node.innerHTML
    })
  }
}


function figure (node)
{
  var img = node.querySelector('img')
  if (node.tagName == 'FIGURE' && img)
  {
    var args = {
      name: 'figure',
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt')
    }
    
    var caption = node.querySelector('figcaption')
    if (caption)
    {
      args.caption = Array.prototype
        .filter.call(caption.childNodes, function (x) { return x.nodeType == 3 })
        .map(function (x) { return x.nodeValue })
        .join('')
      
      var attribution = caption.querySelector('.attribution')
      if (attribution)
      {
        var link = attribution.querySelector('a')
        if (link)
        {
          args.attribution = {
            text: link.innerText,
            url: link.getAttribute('href')
          }
        }
        else
        {
          args.attribution = { text: attribution.innerText }
        }
      }
    }
    
    return model.embed.create(args)
  }
}


function list (node)
{
  if ((node.tagName == 'UL' || node.tagName == 'OL') && node.childNodes.length > 0)
  {
    var elements = []
    Array.prototype.forEach.call(node.childNodes, function (child_node)
    {
      if (child_node.nodeType == 1 && child_node.tagName == 'LI')
      {
        var context = {
          text: '',
          annotations: []
        }
        
        Array.prototype.forEach.call(child_node.childNodes, parse_text_child_node.bind(null, context))
        
        elements.push(model.list.create(
        {
          name: node.tagName.toLowerCase(),
          text: context.text,
          attributes: parse_attributes(child_node),
          annotations: context.annotations
        }))
      }
    })
    return elements
  }
}


function text (node)
{
  var context = {
    text: '',
    annotations: []
  }
  
  Array.prototype.forEach.call(node.childNodes, parse_text_child_node.bind(null, context))
  
  var tag = node.tagName.toLowerCase()
  
  if (allowed_block_elements.indexOf(tag) < 0)
  {
    tag = 'p'
  }
  
  return model.text.create(
  {
    name: tag,
    text: context.text,
    attributes: parse_attributes(node),
    annotations: context.annotations
  })
}

function parse_text_child_node (context, node)
{
  if (node.nodeType == 3)
  {
    context.text += node.nodeValue
  }
  else if (node.nodeType == 1)
  {
    var offset = context.text.length
    var children = Array.prototype.slice.apply(node.childNodes)
    
    if (children.length > 0)
    {
      for (var i=0; i<children.length; i++)
      {
        parse_text_child_node(context, children[i])
      }
    }
    
    var tag = node.tagName.toLowerCase()
    var priority = allowed_inline_elements.indexOf(tag)
    
    if (-1 < priority)
    {
      context.annotations.push(
        model.annotation.create(
        {
          offset: offset,
          length: context.text.length - offset,
          priority: priority,
          name: tag,
          attributes: parse_attributes(node)
        })
      )
    }
  }
}

function parse_attributes (node)
{
  var attrs = {}
  Array.prototype.forEach.call(node.attributes, function (a)
  {
    attrs[a.name] = a.value
  })
  
  delete attrs.style
  
  return attrs
}