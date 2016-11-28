'use strict'

var Annotation = require('./annotation')

module.exports = 
{
  create: function (args)
  {
    return Object.assign({
      type: 'text',
      name: 'p',
      attributes: {},
      text: '',
      annotations: []
    }, args)
  },
  
  cut: function (element, start, end)
  {
    if (element.text.length <= end - start)
    {
      return Object.assign({}, element, {
        text: '',
        annotations: []
      })
    }
    else
    {
      return Object.assign({}, element, {
        text: element.text.slice(0, start) + element.text.slice(end),
        annotations: Annotation.clear_range(element.annotations, start, end).map(function (ann)
        {
          if (ann.offset >= end)
          {
            return Object.assign({}, ann, { offset: ann.offset - (end - start) })
          }
          else
          {
            return ann
          }
        })
      })
    }
  }
}