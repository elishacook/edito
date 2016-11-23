'use strict'

module.exports = 
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