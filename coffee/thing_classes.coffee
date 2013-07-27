$(window).ready ->

  E = window.Entities.classes

  class Installable extends E.DThing
    setup_1: ()->
      this.name = @nombre
      this.moveable = true
      this.buildable = true
      this.removable = true
      this.selectable = true
      this.place_interior = true
      this.place_exterior = true
      this.layout = [[2]]

  class Door extends Installable
    setup: ()->
      this.name = 'door'
      this.nombre = 'door'
      this.image = 'door'


    check_clear: (loc, rot)->
      check_tile = (loc)->
        t = window.Map.get("tiles", loc[0], loc[1])
        if t
          return t
        return false
      
      l = check_tile( [loc[0] - 1, loc[1]] )
      r = check_tile( [loc[0] + 1, loc[1]] )
      t = check_tile( [loc[0], loc[1] - 1] )
      b = check_tile( [loc[0], loc[1] + 1] )

      if l and r and l.is_wall() and r.is_wall()
        return true
      else if t and b and t.is_wall() and b.is_wall()
        return true

    install: ()->
      console.log "INSTALL CALLED"
      window.Map.set('pathfinding', @tile_pos[0], @tile_pos[1], 0)

      ###
    init: ->
      @drawn = false
      @open = 0

      @attach_to_map()

      window.Draw.use_layer('objects')
      window.Draw.clear_box(@pos[0], @pos[1], 32, 32);

      
    place: ()->
      console.log 'Door placed'
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
      ###




  class Locker extends Installable
    setup: ()->
      @name = 'locker'
      @nombre = 'locker'
      @image = 'locker'
      @layout = [[3]]

  class Solarpanel extends Installable
    setup: ()->
      @name = 'solarpanel'
      @nombre = 'solarpanel'
      @image = 'solarpanel'
      @layout = [[3,2]]



  class Airtank extends Installable
    setup: ()->
      @name = 'airtank'
      @nombre = 'airtank'
      @image = 'airtanks'
      @layout = [[3]]
      this.moveable = true
      this.removeable = true
    install: ()->
      console.log 'airtanks installed'
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


  class RandRock extends E.Thing
    init: ->
      roll = Math.random()
      if roll > .1
        @specs = [[0,0,32], [1,0,32],[2,0,32],[3,0,32] ].random() 
        @block_path = false
      else if roll < .02
        @specs = [[0,.5,64], [1,1.5,64], [ 0, 1.666, 96]].random() 
        @block_path = true
      else
        @specs = [[2,1,32], [3,1,32], [2,2,32], [3,2,32], [1,3,32], [2, 1.5, 64], [4,2,32]].random() 
        @block_path = true

      @dim = @specs[2]

      if typeof @specs[2] is 'object'
        @sprite_size = @specs[2][0]
      else
        @sprite_size = @specs[2]
      @sx = @specs[0]
      @sy = @specs[1]
      
      

      @attach_to_map()
    draw: ->
      if @persistant_draw is true
        if @needs_draw
          window.Draw.use_layer 'objects'
          drawn = window.Draw.sub_image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @dim, [@sx, @sy],  @opacity)
          if drawn
            @needs_draw = false


  window.Entities.classes.Installable = Installable
  window.Entities.classes.Door = Door
  window.Entities.classes.Airtank = Airtank
  window.Entities.classes.Locker = Locker
  window.Entities.classes.Solarpanel = Solarpanel
  window.Entities.classes.RandRock = RandRock