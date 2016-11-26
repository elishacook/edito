'use strict'

var Annotation =
{
  create: function (args)
  {
    return Object.assign({
      offset: 0,
      length: 0,
      priority: 0,
      name: 'bold',
      attributes: {}
    }, args)
  },
  
  overlaps: function (annotation, start, end)
  {
    return (annotation.offset < end && annotation.offset + annotation.length > start)
  },
  
  clear_range: function (annotations, start, end)
  {
    var new_annotations = []
    var length = end - start
    
    annotations.forEach(function (ann)
    {
      var ann_end = ann.offset + ann.length
      
      if (Annotation.overlaps(ann, start, end))
      {
        // Annotation is completely cleared
        if (start <= ann.offset && end >= ann_end)
        {
          return
        }
        
        // A chunk out of the middle
        if (start > ann.offset && end < ann_end)
        {
          new_annotations.push(
            Object.assign({}, ann, {
              length: ann.offset - start
            })
          )
          new_annotations.push(
            Object.assign({}, ann, {
              offset: end,
              length: ann.end - end
            })
          )
        }
        // The beginning cut off
        else if (start <= ann.offset)
        {
          new_annotations.push(
            Object.assign({}, ann, {
              offset: end,
              length: ann_end - end
            })
          )
        }
        // The end cut off
        else
        {
          new_annotations.push(
            Object.assign({}, ann, {
              length: start - ann.offset
            })
          )
        }
      }
      else
      {
        new_annotations.push(ann)
      }
    })
    
    return new_annotations
  },
  
  get_actions: function (annotations)
  {
    annotations.sort(function (a, b)
    {
      return a.priority - b.priority
    })
    
    var actions = {}
    
    annotations.forEach(function (a)
    {
      add_action(actions, 'open', a.offset, a)
      
      annotations.forEach(function (b)
      {
        if (b == a)
        {
          return
        }
        
        if (b.priority < a.priority &&
          a.offset < b.offset + b.length &&
          a.offset + a.length > b.offset)
        {
          if (a.offset < b.offset)
          {
            add_action(actions, 'close', b.offset, a)
            add_action(actions, 'open', b.offset, a)
          }
          
          if (a.offset + a.length > b.offset + b.length)
          {
            add_action(actions, 'close', b.offset + b.length, a)
            add_action(actions, 'open', b.offset + b.length, a)
          }
        }
      })
      
      add_action(actions, 'close', a.offset + a.length, a)
    })
    
    return actions
  }
}

function add_action (actions, type, offset, ann)
{
  if (!actions[offset])
  {
    actions[offset] = {}
  }
  
  if (!actions[offset][type])
  {
    actions[offset][type] = []
  }
  
  actions[offset][type].push(ann)
}

module.exports = Annotation