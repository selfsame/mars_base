


window.Placer =
  init: ->
    @build_mode = false
    @type = false
    @valid = false
    @available = {}
    @icons = {}
    @jobs = []
    @job_visuals = []
    window.Events.add_listener(@)

  update: (delta)->
    window.Draw.use_layer 'entities'
    if @build_mode and @type
      pos = [window.Events.tile_under_mouse[0]*window.Map.tilesize, window.Events.tile_under_mouse[1]*window.Map.tilesize]
      if @valid
        color = "rgba(0, 255, 255, .5)"
      else
        color = "rgba(255, 20, 10, .5)"
      window.Draw.draw_box(pos[0],pos[1],window.Map.tilesize,window.Map.tilesize, {fillStyle:color, strokeStyle:color, lineWidth:2})

      #color = "rgba(0, 255, 255, .25)"
      #for job in @jobs
      #  pos = job[1]
      #  window.Draw.draw_box(pos[0],pos[1],window.Map.tilesize,window.Map.tilesize, {fillStyle:color, strokeStyle:color, lineWidth:1})


    for job in @job_visuals #[ @type, @icons[@type], pos ]
      x = job[2][0]*window.Map.tilesize
      y = job[2][1]*window.Map.tilesize
      window.Draw.image( job[1], x, y, window.Map.tilesize, window.Map.tilesize, false, .5)
      
  register: (object)->
    if not @available[object.nombre]
      @available[object.nombre] = 1
    else
      @available[object.nombre] += 1
    if not @icons[object.nombre]
      @icons[object.nombre] = object.image

  mousemove: (e)->
    if @build_mode and @type
      pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]]
      left = window.Map.get('tiles', pos[0]-1, pos[1])
      right = window.Map.get('tiles', pos[0]+1, pos[1])

      top = window.Map.get('tiles', pos[0], pos[1]-1)
      bottom = window.Map.get('tiles', pos[0], pos[1]+1)
      center = window.Map.get('tiles', pos[0], pos[1])
      @valid = false
      if @type is 'door'
        if left and left.is_wall() and right and right.is_wall()
          @valid = 'door_h'
        else if top and top.is_wall() and bottom and bottom.is_wall()
          @valid = 'door_v'
        else
          @valid = false
      else if @type in ['poop']
        if center and not center.is_wall()
          @valid = true
      else
        @valid = true

  update_menu: ()->
    $('#place').find('#menu').html ''
    for key of @available
      if @available[key] > 0
        option = $('<div class="ui_menu_option"><p class="">'+key+': '+@available[key]+'</p><img src="'+window.Draw.images[@icons[key]].src+'"></div>')
        option.attr('value', key)
        if @type and @type is key
          option.addClass 'active'

        option.click (e)->
          $(this).parent().children().removeClass 'active'
          $(this).addClass 'active'
          window.Placer.type = $(this).attr('value')

        $('#place').find('#menu').append(option)

  mouseup: (e)->
    if not $('#UI_overlay').is( $(e.target).parents() )
      if @build_mode and @type and @valid
        pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]]
        @jobs.push [@type, pos]

        @job_visuals.push [ @type, @icons[@type], pos ]

        if @available[@type]
          @available[@type] -= 1
        if @available[@type] <= 0
          @available[@type] = 0
          @type = false
        @update_menu()


  confirm: ()->
    pos = [window.Events.tile_under_mouse[0]*window.Map.tilesize, window.Events.tile_under_mouse[1]*window.Map.tilesize]
    temp = new window.Entities.classes.Door('Door',@valid, pos)

  job_done: (order)->
    for job in @job_visuals
      if job[0] is order[0] and job[2][0] is order[1][0] and job[2][1] is order[1][1]
        @job_visuals.remove job
        return true
    return false
    

$(window).ready ->
  window.Placer.init()



