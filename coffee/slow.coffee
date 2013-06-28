$(window).ready ->

  class SlowEntity
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
      
      #if @['_'+@state]?
      #  @['_'+@state]()
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


  class SlowWalker extends SlowEntity
    init: ->
      @state = 'idle'
      @speed = 4
      @turn_speed = .04
      @target = 0
      @path = 0
      @vector = @normalize_vector( new Vector(0,1,0))
      @new_vector = false
      @wait_time = 0
      @total_time = 0
      @frame_count = 0
      @footprint_img = 'prints'
      @velcoity = .1
      @draw_prints = 0
      @rotate_sprite = 1
      @pos = [@pos[0]-@pos[0]%32, @pos[1]-@pos[1]%32]
      @sprite_size = 32
      @sprite_offset = [0,0]
      @claimed = false
      window.Entities.sentient.push @
      window.Entities.sentient_hash.add @
      @setup()

    setup: ()->

    _get_objects_here: ()->
      map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if map and map.length
        return map
      return []

    draw: ->
      for thing in @_get_objects_here()
        if thing.visited
          thing.visited()
      @draw_sprite()
      window.Draw.context.fillStyle = 'white'
      window.Draw.draw_text(@state, @pos[0]+2, @pos[1]+43, {fillStyle: 'white', font:'courier', fontsize: 8})

      for s, i in @debug
        window.Draw.draw_text(s, @pos[0]+18, @pos[1]+i*11, {fillStyle: 'white', font:'courier', fontsize: 8})
      @debug = []
      if @target
        x = @target[0]*window.Map.tilesize
        y = @target[1]*window.Map.tilesize
        #window.Draw.draw_box(x, y, 32, 32, {fillStyle:'transparent',strokeStyle:'rgba(250,250,0,.4)',lineWidth:1})

      #window.Draw.draw_box(@tile_pos[0]*window.Map.tilesize, @tile_pos[1]*window.Map.tilesize, 32, 32, {fillStyle:'transparent',strokeStyle:'rgba(0,250,250,.4)',lineWidth:1})
      for hook in @draw_hooks
        @[hook]()

    draw_sprite: ()->
      rotation = false
      if @vector and @rotate_sprite
        rotation = Math.atan2(@vector.y, @vector.x)
        rotation += Math.PI + Math.PI/2
        #rotation -= (2*Math.PI)/4
        #rotation = -rotation
      if @footprint_img
        if @draw_prints
          @draw_prints = 0
          window.Draw.use_layer 'background'
          window.Draw.image(@footprint_img, @pos[0], @pos[1], 32, 32, rotation)

      window.Draw.use_layer 'entities'
      window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, rotation)

    normalize_vector: (vector)->
      len = vector.length()
      vector = vector.unit().multiply(@speed)
      return vector

    get_random_tile: (distance=false)->
      if not distance
        x = parseInt(Math.random()*window.Map.width)
        y = parseInt(Math.random()*window.Map.height)
      else
        x = parseInt((Math.random()*distance*2)-distance) + @tile_pos[0]
        y = parseInt((Math.random()*distance*2)-distance) + @tile_pos[1]
        x = window.util.constrict(x, 0, window.Map.width)
        y = window.util.constrict(y, 0, window.Map.height)
      return [x,y]

    path_to: (pos)->
      path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], pos[0], pos[1])
      if path and path.length? and path.length > 0
        @path = path
        @state = 'moving'
        return true
      else
        @state = 'wait'
        return false

    path_close_to: (pos)->
      path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], pos[0], pos[1])
      if path and path.length? and path.length > 0
        return path
      else
        for i in [-1..1]
          for j in [-1..1]
            path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], pos[0]+i, pos[1]+j)
            if path and path.length? and path.length > 0
              return path
      return false

    radians_between_vectors: (v1, v2)->

      l1 = v1.unit()
      l2 = v2.unit()
      l3 = l1.subtract(l2)
      l3.length()

    move: (friction=.95)->
      @vector = @vector.multiply(.90)
      if not @vvv
        @vvv =  new Vector(0,0,0)
      if not @dist_to_target
        return
      
      r = @radians_between_vectors(@vvv, @vect_to_target)
      
      
      if r > .5
        friction = (1-r)

      @vvv = (@vvv).multiply(friction)
      @vvv = @vvv.add(@vector.multiply(.2))  
      if @vvv.length() > @speed
        @vvv = @normalize_vector(@vvv)
      if @vvv.length() > @speed/3
        if @frame_count%18 is 0
          @draw_prints = 1
      #illegal = @get_illegal_pos()
      avoid = @get_floor_avoidance()
      if avoid? and avoid not in [false,undefined] and avoid.x?

        #window.Draw.use_layer('entities')
        #window.Draw.draw_line(@pos[0]+16, @pos[1]+16, @pos[0]+avoid.x*320+16, @pos[1]+avoid.y*320+16, {fillStyle:'cyan',strokeStyle:'cyan',lineWidth:1})

        l = avoid.length()
        
        if l > 1 
          if l > 10
            avoid = avoid.unit().multiply(10)
          @pos[0] += avoid.x
          @pos[1] += avoid.y 
          window.Entities.sentient_hash.update_member @
          return

      @pos[0] += @vvv.x
      @pos[1] += @vvv.y 

      window.Entities.sentient_hash.update_member @


    get_floor_avoidance: ->

      v = new Vector(0,0,0)
      count = 0
      for i in [-1..1]
        for j in [-1 .. 1]

          tile = window.Map.get 'pathfinding', @tile_pos[0]+i, @tile_pos[1]+j
          if tile is 1
            
            #window.Draw.draw_box(((@tile_pos[0]+i)*window.Map.tilesize), ((@tile_pos[1]+j)*window.Map.tilesize), 32, 32, {fillStyle:'rgba(250,250,0,.4)',strokeStyle:'rgba(250,250,0,.4)',lineWidth:1})
            
            x =  ((@tile_pos[0]+i)*window.Map.tilesize) - (@pos[0] )
            y =  ((@tile_pos[1]+j)*window.Map.tilesize) - (@pos[1] )
            n_v = new Vector(x,y,0)
            #window.Draw.draw_line(@pos[0]+16, @pos[1]+16, @pos[0]+n_v.x+16, @pos[1]+n_v.y+16, {fillStyle:'cyan',strokeStyle:'cyan',lineWidth:1})
            nl = n_v.length()

            count += 1
            n_v = n_v.unit().multiply(32/nl)
            v = v.add( n_v )
      if count > 0
        v = v.divide(count).multiply(.15)
        return v
      return false

    n_tiles_away: (p1,p2, n)->
      if p1[0] > p2[0]-n and p1[0] < p2[0]+n and p1[1] > p2[1]-n and p1[1] < p2[1]+n
        return true

    find_unclaimed_object: (nombre)->
      found = false
      distance = 2000
      local = window.Entities.objects_hash.get_within( [@pos[0], @pos[1]], distance )
      if local

        for obj in local
          if obj.nombre is nombre
            if not obj.claimed
              if not (@job is 'place' and obj.placed is true)
                path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], obj.tile_pos[0], obj.tile_pos[1])
                if path and path.length? and path.length > 0
                  @path = path
                  obj.claimed = true
                  @claim = obj
                  return true
      return false


  class Scripted extends SlowWalker
    init_2: ->
      @parsed_script = false
      @parser = false
      @script = "
main(
  wander,
  wait 120.
)
"
      try
        @parsed_script = window.slow_parser.parse @script
      catch error
        console.log 'parse error: ', error, @script
      console.log @parsed_script
      if @parsed_script
        @parser = new SlowParser(@, @parsed_script)

    update: (delta)->
      if @parser
        @parser.exec()

    _wander: ->
      console.log 'wander'

    _wait: ->
      console.log 'wait'

  class SlowParser
    constructor: (@self, @json)->
      @behavior = false
      @code_line = 0

    exec: ->
      if not @behavior
        for aobj in @json
          if aobj.action is 'main'
            @behavior = aobj

      if @behavior
        lines = @behavior.statements
        if lines.length > @code_line
          @run_statement lines[@code_line]
          @code_line += 1
        else
          @code_line = 0
          @behavior = false

    run_statement: (line)->
      index = 0
      if line[0]
        if typeof line[0] is 'object'
          if line[0].type is 'word'
            value = line[0].value
            v = @self['_'+value]
            if v?
              if typeof v is 'function'
                v()
      console.log line






  window.Entities.classes.SlowEntity = SlowEntity
  window.Entities.classes.SlowWalker = SlowWalker
  window.Entities.classes.Scripted = Scripted
