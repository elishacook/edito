var editor = new edito.Editor({
  container: document.getElementById('editor')
})

var blocks = [
  'h1',
  'h2',
  'h3',
  'blockquote'
]

var lists = [
  'ul',
  'ol'
]

var alignment = [
  'left',
  'center',
  'right'
]

var annotations = [
  'bold',
  'italic',
  'underline',
  'strikethru'
]

blocks.forEach(function (b)
{
  document.getElementById('action-'+b).addEventListener('click', function (e)
  {
    e.preventDefault()
    editor.run_command(edito.commands.update_element, editor.get_selection(), { type: 'text', name: b })
  })
})

lists.forEach(function (l)
{
  document.getElementById('action-'+l).addEventListener('click', function (e)
  {
    e.preventDefault()
    editor.run_command(edito.commands.update_element, editor.get_selection(), { type: 'list', name: l })
  })
})

alignment.forEach(function (a)
{
  document.getElementById('action-'+a).addEventListener('click', function (e)
  {
    e.preventDefault()
    editor.run_command(edito.commands.update_style, editor.get_selection(), { 'textAlign': a })
  })
})

annotations.forEach(function (a)
{
  document.getElementById('action-'+a).addEventListener('click', function (e)
  {
    e.preventDefault()
    editor.run_command(edito.commands.toggle_annotation, editor.get_selection(), { name: a })
  })
})