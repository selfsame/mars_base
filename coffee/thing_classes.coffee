$(window).ready ->

  class Entity
    constructor: (@nombre='thing', @image='sprite', @pos=[0,0])->
      @EID = window.get_unique_id()
      @draw_hooks = []

      @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
      @debug = []
      @half_size = 16
      @no_path = false
      @opacity = false
      @sprite_size = 32
      @sprite_offset = [0,0]
      @claimed = false
      @state_que = []
      @hidden = false
      @block_build = false
      @needs_draw = true
      @persistant_draw = true
      @init()
      @init_2()

    init: ->
    init_2: ->
    __update: (delta)->
      @pos_to_tile_pos()
      @delta_time = delta
      @total_time += delta
      @frame_count += 1
      
      if @['_'+@state]?
        @['_'+@state]()
      if not @hidden
        @draw()
      @update(delta)
    que_add_first: (state)->
      @state_que = [state].concat @state_que
    que_add_last: (state)->
      @state_que.push state
    hide: ->
      if not @hidden
        @hidden = true
        if @persistant_draw
          window.Draw.use_layer 'objects'
          window.Draw.clear_box(@pos[0], @pos[1],@sprite_size,@sprite_size)
    show: ->
      if @hidden
        @hidden = false
        if @persistant_draw
          @needs_draw = true

    draw: ->
      if @persistant_draw is true
        if @needs_draw
          window.Draw.use_layer 'objects'
          drawn = window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @opacity)
          if drawn
            @needs_draw = false
      else
        window.Draw.use_layer 'entities'
        drawn = window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @opacity)
      for hook in @draw_hooks
        @[hook]()

    update: ->

    pos_to_tile_pos: ()->
      if @pos?
        @tile_pos = [parseInt((@pos[0]+@half_size)/window.Map.tilesize), parseInt((@pos[1]+@half_size)/window.Map.tilesize)]

    destroy: ()->
      console.log 'destroying ', @
      window.Entities.objects_hash.remove @
      window.Entities.sentient_hash.remove @
      if @no_path
        window.Map.set 'pathfinding', @tile_pos[0], @tile_pos[1], 0
      console.log @ in window.Entities.sentient
      window.Entities.objects.remove @
      window.Entities.sentient.remove @
      if @persistant_draw
        window.Draw.clear_box(@pos[0], @pos[1],@sprite_size,@sprite_size)
      obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if obj_in_map
        obj_in_map.remove @
      delete @

  class Thing extends Entity

    init: ->
      @attach_to_map()

    attach_to_map: ()->
      @show()
      window.Entities.objects.push @
      window.Entities.objects_hash.add @
      obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if not obj_in_map
        window.Map.set('objects', @tile_pos[0], @tile_pos[1], [@])
      else 
        obj_in_map.push @

    detach_from_map: ()->
      @hide()
      window.Entities.objects.remove @
      window.Entities.objects_hash.remove @
      obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if obj_in_map and obj_in_map.length > 0
        obj_in_map.remove @


  class Placeable extends Thing
    init_2: ()->
      @placed_image = @image
      @unplaced_image = @image
      @placed = false
      @registered = false
      if not @registered
        window.Placer.register @
    place: ()->
      console.log @nombre, 'getting placed'
      @placed = true
      @pos_to_tile_pos()
      @image = @placed_image
    unplace: ()->
      @placed = false
      @image = @unplaced_image
      window.Placer.register @

  class Door extends Placeable
    init: ->
      @drawn = false
      @open = 0

      @attach_to_map()

      window.Draw.use_layer('objects')
      window.Draw.clear_box(@pos[0], @pos[1], 32, 32);

    place: ()->
      @placed = true
      @pos_to_tile_pos()
      pos = @tile_pos
      left = window.Map.get('tiles', pos[0]-1, pos[1])
      right = window.Map.get('tiles', pos[0]+1, pos[1])
      top = window.Map.get('tiles', pos[0], pos[1]-1)
      bottom = window.Map.get('tiles', pos[0], pos[1]+1)
      center = window.Map.get('tiles', pos[0], pos[1])
      if left and left.is_wall() and right and right.is_wall()
        @placed_image = 'door_h'
      else if top and top.is_wall() and bottom and bottom.is_wall()
        @placed_image = 'door_v'

      @image = @placed_image
      window.Map.set('pathfinding', @tile_pos[0], @tile_pos[1], 0)
    draw: ->
      if @placed
        @placed_draw()
      else
        if @persistant_draw is true
          if @needs_draw
            window.Draw.use_layer 'objects'
            drawn = window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @opacity)
            if drawn
              @needs_draw = false
        else
          window.Draw.use_layer 'entities'
          drawn = window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @opacity)
      for hook in @draw_hooks
        @[hook]()

    placed_draw: ->
      @open -= 1
      if @open < 0
        @open = 0

      window.Draw.use_layer 'objects'
      window.Draw.clear_box(@pos[0], @pos[1], 32, 32);
      window.Draw.image('supply',@pos[0], @pos[1], 32, 32);
      if @image is 'door_h'
        window.Draw.image('corridor', @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0]+11, (@sprite_size-1)-@open, 10, {fillStyle:'red'})
      else
        window.Draw.image('corridor', @pos[0]+@sprite_offset[0]+11, @pos[1]+@sprite_offset[0], 10, (@sprite_size-1)-@open, {fillStyle:'red'})

      #window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], (@sprite_size), @sprite_size)


      for hook in @draw_hooks
        @[hook]()
    visited: ()->
      @open += 2
      if @open > 32
        @open = 32

  class Launchpad extends Thing
    init: ->
      @persistant_draw = true
      @block_build = true
      @attach_to_map()


  class Airtank extends Placeable
    use: (entity)->
      if not @oxygen
        @oxygen = 80000
        @max_oxygen = 80000
      if @oxygen > 30
        entity.oxygen += 30
        @oxygen -= 30
      else
        return true

      if entity.oxygen >= entity.max_oxygen
        return true

      if @oxygen >= @max_oxygen
        @nombre = 'empty tank'
        @image = 'emptytanks'


  window.Entities.classes.Entity = Entity
  window.Entities.classes.Thing = Thing
  window.Entities.classes.Placeable = Placeable
  window.Entities.classes.Door = Door
  window.Entities.classes.Launchpad = Launchpad
  window.Entities.classes.Airtank = Airtank