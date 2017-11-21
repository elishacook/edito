'use strict'

var events = require('./events')
var html = require('./html')
var parse = html.parse
var render = html.render
var selection = html.selection

module.exports = {
  Editor: Editor,
  Model: require('./model'),
  Commands: require('./commands')
}

function Editor(args)
{
  Object.assign(
    this,
    {
      container: document.getElementById('edito'),
      onchange: null,
      onselectionchange: null,
    },
    args
  )
  
  this.frozen_selection = null
  this.document = parse(this.container)
  render(this.container, this.document)
  
  this.container.contentEditable = true
  
  this.container.addEventListener('focus', events.focus.bind(null, this))
  this.container.addEventListener('blur', events.blur.bind(null, this))
  this.container.addEventListener('paste', events.paste.bind(null, this))
  this.container.addEventListener('input', events.input.bind(null, this))
  this.container.addEventListener('keydown', events.keydown.bind(null, this))
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
    if (this.frozen_selection)
    {
      return this.frozen_selection
    }
    else
    {
      return selection.get(this.container, this.document)
    }
  },
  
  set_selection: function (x)
  {
    if (this.frozen_selection)
    {
      this.frozen_selection = x
    }
    else
    {
      selection.set(this.container, this.document, x)
    }
  },

  freeze_selection: function (sel)
  {
    this.frozen_selection = sel || selection.get(this.container, this.document)
  },

  unfreeze_selection: function ()
  {
    if (this.frozen_selection)
    {
      var x = this.frozen_selection
      this.frozen_selection = null
      this.set_selection(x)
    }
  },
  
  batch_commands: function (cmds)
  {
    var result = null
    cmds.forEach(function (x)
    {
      result = this._run_command.apply(this, x)
    }.bind(this))
    this._update_after_command(result)
  },

  run_command: function ()
  {
    this._update_after_command(
      this._run_command.apply(this, arguments)
    )
  },

  _run_command: function ()
  {
    var args = Array.prototype.slice.apply(arguments)
    var fn = args.shift()
    args.unshift(this.document)
    return fn.apply(null, args)
  },

  _update_after_command: function (result)
  {
    if (result)
    {
      this.document = result.document
      const html = render(this.container, this.document)
      this.set_selection(result.selection)

      if (this.onchange) {
        this.onchange(html)
      }
    }
  },

  can_undo: function ()
  {
    return false;
  },

  can_redo: function ()
  {
    return false;
  }
})