'use strict'

module.exports = function (array, start, delete_count/* , item1, item2, ... */)
{
  var array_copy = Array.prototype.slice.apply(array)
  var items = Array.prototype.slice.call(arguments, 3)
  var args = [start, delete_count].concat(items)
  array_copy.splice.apply(array_copy, args)
  return array_copy
}