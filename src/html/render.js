'use strict'

var Annotation = require('../model/annotation')

module.exports = function (node, document)
{
  var context = {}
  var html = document.elements.map(render_element.bind(null, context)).join('')
  html += close_list(context)
  node.innerHTML = html
}

function render_element (context, element)
{
  if (element.type == 'text')
  {
    return render_text(element, context)
  }
  else if (element.type == 'list')
  {
    return render_list(element, context)
  }
  else if (element.type == 'embed')
  {
    return render_embed(element, context)
  }
  else
  {
    throw new Error('No handler for element type "'+element.type+'"')
  }
}

function render_text (element, context)
{
  return close_list(context) + open_tag(element) + render_annotations(element) + close_tag(element)
}

function render_list (element, context)
{
  var html = ''
  
  if (context.list)
  {
    if (context.list != element.name)
    {
      html += close_tag({ name: context.list })
    }
  }
  else
  {
    context.list = element.name
    html += open_tag(element)
  }
  
  return html + open_tag({ name: 'li' }) + render_annotations(element) + close_tag({ name: 'li' })
}

function render_embed (element, context)
{
  var element = Object.assign({}, element, { attributes: { contentEditable: 'false' } })
  
  if (element.name == 'figure')
  {
    return close_list(context) + render_figure(element)
  }
  else if (element.name == 'oembed')
  {
    return close_list(context) + render_oembed(element)
  }
  else
  {
    throw new Error('No handler for embed type "'+element.name+'"')
  }
}

function render_figure (element)
{
  var contents = '<img src="'+element.src+'"'+(element.alt ? ' alt="'+element.alt+'"' : '')+'>'
  
  if (element.caption || element.attribution)
  {
    var parts = []
    if (element.caption)
    {
      parts.push(element.caption)
      
      if (element.attribution)
      {
        var attribution = null
        if (element.attribution.url)
        {
          attribution = '<a href="'+element.attribution.url+'">'+(element.attribution.text ? element.attribution.text : element.attribution.url)+'</a>'
        }
        else if (element.attribution.text)
        {
          attribution = element.attribution.text
        }
        
        if (attribution)
        {
          parts.push('<div class="attribution">'+attribution+'</div>')
        }
      }
    }
    
    if (parts.length > 0)
    {
      contents += '<figcaption>'+parts.join('')+'</figcaption>'
    }
  }
  
  return open_tag(element) + contents + close_tag(element)
}

function render_oembed (element)
{
  return '<div class="oembed">'+element.html+'</div>'
}

function open_tag (element)
{
  return '<'+element.name+' '+render_attributes(element.attributes)+'>'
}

function close_tag (element)
{
  return '</'+element.name+'>'
}

function close_list (context)
{
  if (context.list)
  {
    var args = { name: context.list }
    context.list = null
    return close_tag(args)
  }
  else
  {
    return ''
  }
}

function render_attributes (attributes)
{
  if (!attributes)
  {
    return ''
  }
  
  var attrs_string = []
  Object.keys(attributes).forEach(function (k)
  {
    if (k == 'className')
    {
      attrs_string.push('class='+attributes[k])
    }
    else
    {
      attrs_string.push(k+'="'+attributes[k]+'"')
    }
  })
  return attrs_string.join(' ')
}

function render_annotations (element)
{
  if (!element.annotations || element.annotations.length == 0)
  {
    return element.text
  }
  else
  {
    var actions = Annotation.get_actions(element.annotations)
    var chars = element.text
    var html = ''
    var i=0
    
    for (i=0; i<chars.length; i++)
    {
      html += render_annotation_actions('open', open_tag, actions[i])
      html += chars[i]
      html += render_annotation_actions('close', close_tag, actions[i+1])
    }
    
    return html
  }
}

function render_annotation_actions (type, render, actions)
{
  var html = ''
  
  if (actions && actions[type])
  {
    actions[type].forEach(function (ann)
    {
      html += render(ann)
    })
  }
  
  return html
}