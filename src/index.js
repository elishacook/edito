'use strict'

var model = require('./model')
var events = require('./events')
var html = require('./html')
var parse = html.parse
var render = html.render
var selection = html.selection

module.exports = {
  Editor: Editor
}

function Editor(args)
{
  Object.assign(
    this,
    {
      container: document.getElementById('edito'),
      onchange: null
    },
    args
  )
  
  this.document = parse(this.container)
  render(this.container, this.document)
  
  this.container.contentEditable = true
  
  this.container.addEventListener('paste', events.paste.bind(null, this))
  this.container.addEventListener('keydown', events.keydown.bind(null, this))
  this.container.addEventListener('keypress', events.keypress.bind(null, this))
  this.container.addEventListener('keyup', events.keyup.bind(null, this))
  document.addEventListener('selectionchange', events.selectionchange.bind(null, this))
}

Object.assign(Editor.prototype, 
{
  parse: function ()
  {
    this.document = parse(this.container)
  },
  
  get_selection: function ()
  {
    return selection.get(this.container, this.document)
  },
  
  set_selection: function (x)
  {
    selection.set(this.container, this.document, x)
  },
  
  run_command: function ()
  {
    var args = Array.prototype.slice.apply(arguments)
    var fn = args.shift()
    args.unshift(this.document)
    var result = fn.apply(null, args)
    
    if (result)
    {
      this.document = result.document
      console.log(this.document)
      render(this.container, this.document)
      this.set_selection(result.selection)
    }
  }
})