


window.Placer =
  init: ->
    @build_mode = false
    @type = false
    @valid = false
    window.Events.add_listener(@)

  update: (delta)->
    if @build_mode and @type
      pos = [window.Events.tile_under_mouse[0]*window.Map.tilesize, window.Events.tile_under_mouse[1]*window.Map.tilesize]
      if @valid
        color = "rgba(0, 255, 255,.5)"
      else
        color = "rgba(255, 20, 10,.5)"
      window.Draw.draw_box(pos[0],pos[1],window.Map.tilesize,window.Map.tilesize, {fillStyle:color, strokeStyle:color, lineWidth:2})
      

  mousemove: (e)->
    if @build_mode and @type
      pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]]
      left = window.Map.get('tiles', pos[0]-1, pos[1])
      right = window.Map.get('tiles', pos[0]+1, pos[1])

      top = window.Map.get('tiles', pos[0], pos[1]-1)
      bottom = window.Map.get('tiles', pos[0], pos[1]+1)
      if left and left.is_wall() and right and right.is_wall()
        @valid = 'door_h'
      else if top and top.is_wall() and bottom and bottom.is_wall()
        @valid = 'door_v'
      else
        @valid = false

  mouseup: (e)->
    if @build_mode and @type
      if @valid
        pos = [window.Events.tile_under_mouse[0]*window.Map.tilesize, window.Events.tile_under_mouse[1]*window.Map.tilesize]
        temp = new window.Entities.classes.Door('Door',@valid, pos)

  confirm: ()->
    pos = [window.Events.tile_under_mouse[0]*window.Map.tilesize, window.Events.tile_under_mouse[1]*window.Map.tilesize]
    temp = new window.Entities.classes.Door('Door',@valid, pos)
    

$(window).ready ->
  window.Placer.init()



