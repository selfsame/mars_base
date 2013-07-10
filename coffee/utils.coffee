window.requestAnimFrame = (->
  window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or (callback) ->
    window.setTimeout callback, 1000 / 60
)()

Array::remove = (item)->
  indx = @indexOf(item)
  if indx != -1
    return @.splice(indx,1)

Array::get_last = ()->
  return this[this.length-1]

Array::set_last = (value)->
  return this[this.length-1] = value

Array::transpose = ->
  a = this
  w = (if a.length then a.length else 0)
  h = (if a[0] instanceof Array then a[0].length else 0)
  return []  if h is 0 or w is 0
  i = undefined
  j = undefined
  t = []
  i = 0
  while i < h
    t[i] = []
    j = 0
    while j < w
      t[i][j] = a[j][i]
      j++
    i++
  t

Array::reverse_rows = ->
  a = this
  h = (if a.length then a.length else 0)
  w = (if a[0] instanceof Array then a[0].length else 0)
  return []  if h is 0 or w is 0
  i = undefined
  j = undefined
  t = []
  i = 0
  while i < h
    t[i] = []
    j = 0
    while j < w
      t[i][j] = a[i][w - 1 - j]
      j++
    i++
  t

Array::reverse_cols = ->
  a = this
  h = (if a.length then a.length else 0)
  w = (if a[0] instanceof Array then a[0].length else 0)
  return []  if h is 0 or w is 0
  i = undefined
  j = undefined
  t = []
  i = 0
  while i < h
    t[i] = []
    j = 0
    while j < w
      t[i][j] = a[h - 1 - i][j]
      j++
    i++
  t

Array::clone = ->
  i = undefined
  r = undefined
  _i = undefined
  _len = undefined
  r = []
  _i = 0
  _len = @length

  while _i < _len
    i = this[_i]
    r.push i
    _i++
  r

window.get_function_arg_strings = (func) ->
  funStr = func.toString()

  results = funStr.slice(funStr.indexOf("(") + 1, funStr.indexOf(")")).match /([^\s,]+)/g

  return results


window.unique_id_counter = 0
window.get_unique_id = ()->
  window.unique_id_counter += 1
  return window.unique_id_counter


$(document).delegate "textarea.tabindent", "keydown", (e) ->
  keyCode = e.keyCode or e.which
  if keyCode is 9
    e.preventDefault()
    start = $(this).get(0).selectionStart
    end = $(this).get(0).selectionEnd
    
    # set textarea value to: text before caret + tab + text after caret
    $(this).val $(this).val().substring(0, start) + "\t" + $(this).val().substring(end)
    
    # put caret at right position again
    $(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1



window.util = 
  #the double click thing probably will eat up memory one way or another
  considered: 0
  last_click: 0
  disabled: []
  double_click: (element)->
    element = $(element)[0]
    date = new Date()
    t = date.getTime()
    #if @considered is undefined
    #  return
    console.log "click check: ", element, @considered
    if @considered is element
      if t - @last_click < 400
        console.log "[double_click]: ", @considered, t - @last_click 
        @considered = 0
        @last_click = 0
        return true
      else
        @considered = element
        @last_click = t
        return false
    else
      @considered = element
      @last_click = t
      return false

  disable: (jq)->
    for element in jq
      @disabled.push element
      $(element).css
        'opacity':.15
        'pointer-events':'none'
  enable_all: ()->
    for element in @disabled
      $(element).css
        'opacity':""
        'pointer-events':""
    @disabled = []

  constrict: (value, lower, higher)->
    if value < lower
      value = lower
    else if value > higher
      value = higher
    return value


  rect_intersect: (r1, r2) -> #object with right, left, top, bottom properties
    not (r2.left > r1.right or r2.right < r1.left or r2.top > r1.bottom or r2.bottom < r1.top)
  rect_contains: (r2, r1) -> #object with right, left, top, bottom properties
    (r2.left > r1.left and r2.right < r1.right and r2.top > r1.top and r2.bottom < r1.bottom)