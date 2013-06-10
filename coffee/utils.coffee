window.requestAnimFrame = (->
  window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or (callback) ->
    window.setTimeout callback, 1000 / 60
)()

Array.prototype.remove = (item)->
  indx = @indexOf(item)
  if indx != -1
    return @.splice(indx,1)

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