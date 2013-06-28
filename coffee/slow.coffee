$(window).ready ->

  window.Scripter = 
    init: ->
      @watch = false
      window.Events.add_listener(@)
      @inspect = $('<div id="inspect"></div>')
      $('#UI_overlay').append @inspect

    show: (thing)->
      @watch = thing
      @inspect.html ''
      @inspect.append '<p>'+thing.nombre+'</p>'
      @inspect.append '<p>'+thing.tile_pos+'</p>'
      if thing.script and thing.parsed_script
        @inspect.css('diplay', 'block')

        @vars = $('<div class="script_vars"></div>')
        for i in [0..4]
          @vars.append $('<div class="column"></div>')

        i = 0
        for type of @watch.script_vars
          $(@vars.children()[i]).append '<p>'+type+'</p>'
          for item in @watch.script_vars[type]
            if item is false
              item = ''
            $(@vars.children()[i]).append $('<div class="entry">'+item+'</div>')
          i += 1

        @inspect.append @vars

        @script = $('<div class="script_display"><pre><code></pre></code></div>')
        @code = @script.find('code')
        @inspect.append @script
        parsed = thing.parsed_script
        for action in parsed

          span = $('<span></span>')
          span[0].innerHTML = action.begin
          window.scriptbegin = action.begin
          @code.append span

          console.log action.begin
          block = $('<span class="block"></span>')
          @code.append block
          for line in action.literals
            span = $('<span></span>')
            span[0].innerHTML = line
            block.append span

            console.log line


          span = $('<span></span>')
          span[0].innerHTML = action.end
          @code.append span

          console.log action.end
      else
        @script = false

    update: ->
      if @watch and @script and @watch.parser
        @script.find('span').removeClass 'current'
        index = @watch.parser.code_line

        $(@code.find('.block').children()[index]).addClass 'current'


    mouseup: ->
      t = window.Events.tile_under_mouse
      p = {x:t[0]*32, y:t[1]*32}
      found = window.Entities.sentient_hash.get_within([p.x,p.y], 32)
      results = []
      for guy in found
        if guy.tile_pos[0] is t[0] and guy.tile_pos[1] is t[1]
          results.push guy
      if results.length > 0
        console.log 'Selected:', results
        @show results[0]

  window.Scripter.init()

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
      @speed = 2
      @parsed_script = false
      @parser = false
      @script = "
        main (\n
          wait(5);\n
          wait(10);\n
          wait(5);\n
          wait(20); wait( 30 ); wait(10);\n
        \n
        \n
        wander(5);\n
        )
        "
      @script_vars =
        int:[]
        float:[]
        string: []
        vector: []
        entity: []

      for i in [0..9]
        @script_vars.int.push false
        @script_vars.float.push false
        @script_vars.string.push false
        @script_vars.vector.push false
        @script_vars.entity.push false


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

    walk_path: ->
      console.log 'i think ive started walk path'
      if not @path? or @path.length is 0
        return false


      tilesize = window.Map.tilesize

      p1 = @path[0][0]*tilesize
      p2 = @path[0][1]*tilesize
      @vect_to_target = new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0)
      @dist_to_target = @vect_to_target.length()
      @target_vect = @normalize_vector( @vect_to_target )
      @vector = Vector.lerp(@vector, @target_vect, @turn_speed)
      near = 10
      if @pos[0] > p1-near and @pos[0] < p1+near and @pos[1] > p2-near and @pos[1] < p2+near
        @path = @path.splice(1,@path.length)
        @velocity = .1
        if @path.length is 0
          console.log 'i think path is 0 length'
          return true
      else
        @move(1)
      console.log 'i think we ran all the code'
      return false

    _wander: (args = [])->

      if not args[0]
        amount = 10
      else
        amount = args[0]
      
      if not @path or not @target
        @target = @get_random_tile(amount)
        @path_to @target
        console.log 'wander.. ', @path, @target
      if @walk_path()
        console.log 'walk finished, we done'
        @path = false
        @target = false
        return true

    


    _wait: (args = [])->

      if not args[0]
        amount = 0
      else
        amount = args[0]

      if not @test_timer
        @test_timer = 0
      @test_timer += 1
      if @test_timer > amount
        @test_timer = 0
        return true
      return false

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
        else
          @code_line = 0
          @behavior = false

    run_statement: (line)->
      index = 0
      parts = line.length
      pattern = false
      funct = false
      args = false
      vars = []

      for part in line
        if typeof part isnt 'object'
          console.log 'ERROR parsing part: ', part
        if not pattern
          if part.type is 'word'
            pattern = 'call'
            funct = part.value
        else if pattern is 'call' and args is false
          args = []
          if part.type is 'enclosure'
            for subpart in part.value
              if subpart.type is 'number'
                args.push subpart.value
        else
          console.log 'parsing leftover: ', part.type, part.value

      if pattern is 'call'
        if not args
          args = []
        v = @self['_'+funct]
        if @self['_'+funct]? and typeof @self['_'+funct] is 'function'
          if @self['_'+funct](args)
            @code_line += 1












  window.Entities.classes.SlowEntity = SlowEntity
  window.Entities.classes.SlowWalker = SlowWalker
  window.Entities.classes.Scripted = Scripted
