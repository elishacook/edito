'use strict'

var Document = require('../model').document
var default_recognizers = require('./recognizers')

module.exports = function (node, recognizers)
{
  if (node.childNodes.length == 0)
  {
    return Document.create()
  }
  else
  {
    var recognizers = recognizers || default_recognizers
    return Document.create({
      elements: Array.prototype
        .filter.call(node.childNodes, function (x) { return x.nodeType == 1 })
        .map(function (x) { return parse_element(recognizers, x) })
        .reduce(function (prev, cur)
        {
          if (cur)
          {
            if (cur.constructor == Array)
            {
              return prev.concat(cur)
            }
            else
            {
              prev.push(cur)
            }
          }
          
          return prev
        }, [])
    })
  }
}

function parse_element (recognizers, node)
{
  var element = null
  
  recognizers.some(function (recognize)
  {
    element = recognize(node)
    if (element)
    {
      return true
    }
    else
    {
      return false
    }
  })
  
  return element
}