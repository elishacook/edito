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
  
  contains: function (annotation, start, end)
  {
    return (start >= annotation.offset && end <= annotation.offset + annotation.length)
  },
  
  merge_similar: function (annotations)
  {
    var by_name = {}
    annotations.forEach(function (x)
    {
      if (!by_name[x.name])
      {
        by_name[x.name] = [x]
      }
      else
      {
        by_name[x.name].push(x)
      }
    })
    
    var new_annotations = []
    
    Object.keys(by_name).forEach(function (k)
    {
      var annotations = by_name[k]
      annotations.sort(compare_annotation_offsets)
      
      var stack = [annotations.shift()]
      
      annotations.forEach(function (current)
      {
        var last = stack[stack.length-1]
        var last_end = last.offset + last.length
        var current_end = current.offset + current.length
        
        if (current.offset <= last_end)
        {
          if (current_end > last_end)
          {
            stack[stack.length - 1] = Object.assign({}, last, { length: current_end - last.offset })
          }
        }
        else
        {
          stack.push(current)
        }
      })
      
      new_annotations = new_annotations.concat(stack)
      
    })
    
    return new_annotations
  },
  
  clear_range: function (annotations, start, end)
  {
    var new_annotations = []
    
    annotations
      .forEach(function (ann)
      {
        var ann_end = ann.offset + ann.length
        
        // falls completely within the cleared range
        if (ann.offset >= start  && ann_end <= end)
        {
          return
        }
        // falls completely outside the cleared range
        else if (ann_end <= start || ann.offset >= end)
        {
          new_annotations.push(ann)
        }
        // Cleared range takes a chunk out of the middle
        else if (end < ann_end  && start > ann.offset)
        {
          new_annotations.push(
            Object.assign({}, ann, {
              length: start - ann.offset
            })
          )
          new_annotations.push(
            Object.assign({}, ann, {
              offset: end,
              length: ann_end - end
            })
          )
        }
        // Overlaps beginning
        else if (ann.offset <= start)
        {
          new_annotations.push(
            Object.assign({}, ann, {
              length: start - ann.offset
            })
          )
        }
        // Overlaps end
        else if (ann_end >= end)
        {
          new_annotations.push(
            Object.assign({}, ann, {
              offset: end,
              length: ann_end - end
            })
          )
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

function compare_annotation_offsets (a, b)
{
  return a.offset - b.offset
}

module.exports = Annotation