$(window).ready ->

  class Entity
    constructor: (@nombre='thing', @image='sprite', @pos=[0,0])->
      
      @draw_hooks = []

      @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
      @debug = []
      @half_size = 16
      @no_path = false
      @init()
      @init_2()
      @sprite_size = 32
      @sprite_offset = [0,0]
      @claimed = false
      @state_que = []
      @hidden = false
      @block_build = false
      @needs_draw = true
      @persistant_draw = true
    init: ->
    init_2: ->
    _update: (delta)->
      @pos_to_tile_pos()
      @delta_time = delta
      @total_time += delta
      @frame_count += 1
      
      if @[@state]?
        @[@state]()
      if not @hidden
        @draw()
      @update(delta)
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
      if @needs_draw
        window.Draw.use_layer 'objects'
        drawn = window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size)
        if drawn
          @needs_draw = false
      for hook in @draw_hooks
        @[hook]()
    update: ->

    pos_to_tile_pos: ()->
      if @pos?
        @tile_pos = [parseInt((@pos[0]+@half_size)/window.Map.tilesize), parseInt((@pos[1]+@half_size)/window.Map.tilesize)]
    destroy: ()->
      console.log 'destroying ', @
      window.Entities.objects_hash.remove_member @
      window.Entities.sentient_hash.remove_member @
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
      window.Entities.objects.push @
      window.Entities.objects_hash.add @
      obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if not obj_in_map
        window.Map.set('objects', @tile_pos[0], @tile_pos[1], [@])
      else 
        obj_in_map.push @
      @init_2()

  class Placeable extends Thing
    init_2: ()->
      @placed = false
      window.Placer.register @

  class Door extends Placeable
    init: ->
      @drawn = false
      @open = 0

      window.Entities.objects.push @
      window.Entities.objects_hash.add @
      obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if not obj_in_map
        window.Map.set('objects', @tile_pos[0], @tile_pos[1], [@])
      else 
        obj_in_map.push @

      window.Draw.use_layer('objects')
      window.Draw.clear_box(@pos[0], @pos[1], 32, 32);
      window.Map.set('pathfinding', @tile_pos[0], @tile_pos[1], 0)
    draw: ->
      @open -= 1
      if @open < 0
        @open = 0
      if not @drawn
        #@drawn = true
        window.Draw.use_layer 'tiles'
        window.Draw.clear_box(@pos[0], @pos[1], 32, 32);
        window.Draw.image('supply',@pos[0], @pos[1], 32, 32);
        if @image is 'door_h'
          window.Draw.image('corridor', @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0]+11, (@sprite_size-1)-@open, 10, {fillStyle:'red'})
        else
          window.Draw.image('corridor', @pos[0]+@sprite_offset[0]+11, @pos[1]+@sprite_offset[0], 10, (@sprite_size-1)-@open, {fillStyle:'red'})

        window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], (@sprite_size), @sprite_size)
      for hook in @draw_hooks
        @[hook]()
    visited: ()->
      @open += 2
      if @open > 32
        @open = 32

  class Launchpad extends Thing
    init: ->
      @block_build = true
      window.Entities.objects.push @
      window.Entities.objects_hash.add @
      for i in [-2..3]
        for j in [-2..3]
          obj_in_map = window.Map.get('objects', @tile_pos[0]+i, @tile_pos[1]+j)
          if not obj_in_map
            window.Map.set('objects', @tile_pos[0]+i, @tile_pos[1]+j, [@])
          else 
            obj_in_map.push @

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