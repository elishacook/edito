'use strict'

var commands = require('../commands')
var Range = require('../model/range')

module.exports = 
{
  paste: function (editor, event)
  {
    
  },
  
  input: function (editor, event)
  {
    editor.parse()
  },
  
  keydown: function (editor, event)
  {
    if (event.which >= 37 && event.which <= 40)
    {
      return
    }
    
    var selection = editor.get_selection()
    var selection_spans_multiple = Range.spans_multiple_elements(selection)
    var selection_at_beginning = Range.is_collapsed(selection) && !selection.start.offset
    var is_backspace = event.which == 8 || event.which == 46
    var is_new_line = event.which == 13 || event.which == 5 || (event.which == 77 && event.ctrlKey)
    
    // Check for a delete or backspace
    if (is_backspace && (selection_spans_multiple || selection_at_beginning))
    {
      event.preventDefault()
      editor.run_command(commands.backspace, selection)
    }
    // Check for a new line, carriage return, etc.
    else if (is_new_line)
    {
      event.preventDefault()
      editor.run_command(commands.break, editor.get_selection())
    }
  },
  
  selectionchange: function (editor, event)
  {
  }
}