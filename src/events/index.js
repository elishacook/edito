'use strict'

var commands = require('../commands')
var Range = require('../model/range')

module.exports = 
{
  paste: function (editor, event)
  {
    
  },
  
  keydown: function (editor, event)
  {
    // Check for a delete or backspace
    if (event.which == 8 || event.which == 46)
    {
      var selection = editor.get_selection()
      
      if (Range.spans_multiple_elements(selection) || 
         (Range.is_collapsed(selection) && !selection.start.offset))
      {
        event.preventDefault()
        editor.run_command(commands.backspace, selection)
      }
    }
  },
  
  keyup: function (editor, event)
  {
    event.preventDefault()
  },
  
  keypress: function (editor, event)
  {
    // Check for a new line, carriage return, etc.
    if (event.which == 13 || event.which == 5 ||
      (event.which == 77 && event.ctrlKey))
    {
      event.preventDefault()
      editor.run_command(event.break, editor.get_selection())
    }
    else
    {
      editor.parse()
    }
  },
  
  selectionchange: function (editor, event)
  {
  }
}