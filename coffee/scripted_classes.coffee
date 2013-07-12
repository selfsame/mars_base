$(window).ready ->

  Vect2D =   window.SlowDataTypes.Vect2D
  AxisNum =   window.SlowDataTypes.AxisNum
  EntityRef =   window.SlowDataTypes.EntityRef
  RegisterStack =   window.SlowDataTypes.RegisterStack

  E = window.Entities.classes
  

  class Scripted extends E.Entity
    init_2: ->
      @speed = 2
      @parsed_script = false
      @parser = false
      @script = false
      @error = false    

      try
        @parsed_script = window.slow_parser.parse @script
      catch error
        console.log 'parse error: ', error, @script
      #console.log @parsed_script
      if @parsed_script
        @parser = new window.Entities.slowparser(@, @parsed_script)

    update_2: (delta)->
      @props['pos'] = new Vect2D(@tile_pos[0], @tile_pos[1])
      if @parser
        @parser.exec()

    run_script: (script)->
      @script = script
      try
        @parsed_script = window.slow_parser.parse @script
        @error = false
      catch error
        @error = {line:error.line, column:error.column, message:error.name+': '+error.found}

      if @parsed_script
        #console.log @parsed_script
        @parser = new window.Entities.slowparser(@, @parsed_script)
        @script_vars = {}
        for i in ['I','F','S','V','E']
          @script_vars[i] = []
          for j in [0..9]
            @script_vars[i].push undefined
          @script_vars[i].push new RegisterStack

    walk_path: ->
      if not @path?
        @target = false
        return false

      if @path.length is 0
        @target = false
        @path = false
        return false
      try
        if @path[0].length is 0
          @target = false
          @path = false
          return false
      catch error



      tilesize = window.Map.tilesize

      try
        p1 = @path[0][0]*tilesize
        p2 = @path[0][1]*tilesize
      catch error
        console.log "BAD PATH:", error
        console.log @path
        return false
      @vect_to_target = new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0)
      @dist_to_target = @vect_to_target.length()
      @target_vect = @normalize_vector( @vect_to_target )
      @vector = Vector.lerp(@vector, @target_vect, @turn_speed)
      near = 4
      if @pos[0] > p1-near and @pos[0] < p1+near and @pos[1] > p2-near and @pos[1] < p2+near
        @path = @path.splice(1,@path.length)
        @velocity = .1

        if @path.length is 0
          @friction = .5
          return true
        @friction = .95

      return undefined

  class SlowWalker extends Scripted
    init: ->
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

      @pocket = []

    setup: ()->

    get_objects_here: ()->
      map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if map and map.length
        return map
      return []

    draw: ->
      for thing in @get_objects_here()
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
        return true
      else
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
      avoid = @get_floor_avoidance()
      if avoid? and avoid not in [false,undefined] and avoid.x?
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



  

  class SlowSentient extends SlowWalker

    _debug: (i_f_s_v_e)->
      console.log @nombre, ': ', i_f_s_v_e
      return true

    _wander: (i=10)->
      distance = i
      if not @path or not @target
        @target = @get_random_tile(distance)
        @path_to @target
        if not @path
          @target = false
      if @walk_path()
        @path = false
        @target = false
        return true
      return undefined

    _goto: (e_v)->
      v = e_v
      if typeof v is 'object' and v.x and v.y
        if not @target
          @target = [v.x, v.y]
      else if typeof v is 'object' and v.e
        if not @target
          @target = [v.v.x, v.v.y]

      if not @path and @target
        @path_to [@target[0],@target[1]]

      if @path
        if @walk_path()
          @path = false
          @target = false
          return e_v
        return undefined
      else
        return false

    _go_near: (e_v)->
      v = e_v
      if typeof v is 'object' and v.x and v.y
        if not @target
          @target = [v.x, v.y]
      else if typeof v is 'object' and v.e
        if not @target
          @target = [v.v.x, v.v.y]

      if not @near_options? or @near_options.length is 0
        @near_options = [ [-1,0],[1,0],[0,-1],[0,1],[-1,1],[-1,-1],[1,-1],[1,1],[0,0]]
      if not @path and @target
        if @near_options.length is 0
          return false
        mod = @near_options.pop()

        @path_to [@target[0]+mod[0],@target[1]+mod[1]]

      if @path
        if @walk_path()
          @path = false
          @target = false
          return e_v
        return undefined
      else
        return false

    _wait: (i=10)->
      time = i
      if not @test_timer
        @test_timer = 0
      @test_timer += 1
      if @test_timer > time
        @test_timer = 0
        return true
      return undefined 

    _slow_five: (i=10)->
      time = i
      if not @test_timer
        @test_timer = 0
      @test_timer += 1
      if @test_timer > time
        @test_timer = 0
        return 5
      return undefined 

    _random: (i=100)->

      return parseInt(Math.random() * i)

    _search: (i_s)->
      if typeof i_s is 'number'
        distance = i_s
        filter = false
      else if typeof i_s is 'string'
        distance = 400
        filter = true
      else
        return
      local = window.Entities.objects_hash.get_within( [@pos[0], @pos[1]], distance )
      for obj in local
        if obj.claimed
          console.log obj.nombre, ' claimed!'
        if not obj.claimed and not obj.placed
          if filter
            if i_s is obj.nombre
              return new EntityRef obj
          else
            return new EntityRef obj
      
      return false

    _search_built: (i_s)->
      if typeof i_s is 'number'
        distance = i_s
        filter = false
      else if typeof i_s is 'string'
        distance = 400
        filter = true
      else
        return
      local = window.Entities.objects_hash.get_within( [@pos[0], @pos[1]], distance )
      for obj in local
        if not obj.claimed and obj.placed
          if filter
            if i_s is obj.nombre
              return new EntityRef obj
          else
            return new EntityRef obj
      
      return false

    _use: (e_s)->
      e = -9999
      s = '-00000000'
      if typeof e_s is 'object' and e_s.e
        e = e_s.e
      if typeof e_s is 'string'
        s = e_s
      #console.log "USE ", e
      ground = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
      if ground is 0
        ground = []
      r = @pocket.concat ground
      for o in r
        if o.EID is e or o.nombre is s
          if o.flags? and o.flags['suit']
            @pocket.remove o
            @wear_body = o
            @wear_suit()
            return e
          else if o.use? and typeof o.use is 'function'
            if o.use(@)
              return e
            else
              return undefined
      return false

    wear_suit: ->
      @suit = true
      @oxygen = 6000
      @max_oxygen = 6000
      @image = 'suitwalk'


    _pickup: (e_s)->
      r = []
      for i in [-1..1]
        for j in [-1..1]
          if r isnt 0
            r = r.concat window.Map.get('objects', @tile_pos[0]+i, @tile_pos[1]+j)
      found = false
      if r and r.length > 0
        for obj in r
          if obj isnt 'undefined' and typeof obj is 'object'
            if typeof e_s is 'object'
              if obj.EID = e_s.e
                obj.detach_from_map()
                @pocket.push obj
                obj.pos = @pos
                return e_s
            else if obj.nombre is e_s       
              obj.detach_from_map()
              @pocket.push obj
              obj.pos = @pos
              return e_s
      return false

    _claim: (e)->
      if typeof e is 'object' and e.e?

        EID = e.e
        for o in window.Entities.objects
          if o.EID == EID
            if not o.claimed

              o.claimed = true
              return e

      return false

    _drop: (i_s_e)->
      if typeof i_s_e is 'number'
        if @pocket[i_s_e]?
          found = @pocket[i_s_e]
          @pocket.remove found
          found.attach_to_map([@tile_pos[0], @tile_pos[1]])
          return i_s_e
      else
        for obj in @pocket
          if typeof obj is 'object'
            if typeof i_s_e is 'object' and i_s_e.type is 'e'
              if i_s_e.e is obj.EID
                obj.attach_to_map([@tile_pos[0], @tile_pos[1]])
                @pocket.remove obj
                return i_s_e
            if typeof i_s_e is 'string'
              if obj.nombre is i_s_e
                obj.attach_to_map([@tile_pos[0], @tile_pos[1]])
                @pocket.remove obj
                return i_s_e
      return false

    _pocket: (i_s_e)->
      if typeof i_s_e is 'number'
        if @pocket[i_s_e]?
          return new EntityRef @pocket[i_s_e]
          return true
      else
        for obj in @pocket
          if obj isnt 'undefined' and typeof obj is 'object'
            if typeof i_s_e is 'object' and i_s_e.type is 'e'
              if i_s_e.e is obj.UID 
                return new EntityRef obj
            if typeof i_s_e is 'string'
              if obj.nombre is i_s_e
                return new EntityRef obj
      return false



    _get_task: ()->
      if not @job
        job = window.Jobs.get_job(@)
        if job
          @job = job
          console.log 'assigned a job', @job
      if @job
        task = @job.get_instruction()
        if task
          @props['task'] = task
          return task
        else
          @props['task'] = 0
          @job.complete()
          @job = false
          return false
      return false

    _build: ()->

      if @job and @job.tile?

        if @n_tiles_away( @tile_pos, [@job.tile.x, @job.tile.y], 200 )
          
          @job.tile.build(30)
          if @job.tile.built
            console.log 'tile built'
            return true
          return undefined
      return false

    








  class SlowColonist extends SlowSentient
    setup: ->
      @pocket = []
      @suit = false
      @oxygen = 1200 #naked 
      @max_oxygen = @oxygen
      @walk_frame = 0

    update: (delta)->
      @state = ''
      if @vvv
        len = @vvv.length()
        if len > .2
          @walk_frame += len*.25
          if @walk_frame > 12
            @walk_frame = 0
      if @oxygen?
        tile = window.Map.get('tiles', @tile_pos[0], @tile_pos[1])
        if tile and tile isnt 0
          @oxygen += 5
        if @oxygen > @max_oxygen
          @oxygen = @max_oxygen
        @oxygen -= 1
        @props['oxygen'] = @oxygen
        @props['max_oxygen'] = @max_oxygen
        @props['suit'] = @suit
        if not @job
          @props['job'] = 0
        else
          @props['job'] = @job.type

        ###
        if @job?
          j = @job
          if @job.to_string
            j = @job.to_string()
          t = @props['task']
          if t.to_string
            t = t.to_string()
          @state = j + ' / ' + t
        else
          @state = ''
        ###
        if @oxygen < @max_oxygen*.9
          window.Draw.use_layer 'view'
          w = 32 * (@oxygen / @max_oxygen )
          window.Draw.draw_box(16 + @pos[0]-w*.5, @pos[1]+30, w, 5, {fillStyle:'red',strokeStyle:'rgba('+32-w+','+w+','+w+',.4)',lineWidth:0})
        if @oxygen < 0
          @die()
          return


    draw_sprite: ()->
      
      offset = [parseInt(@walk_frame)%4,parseInt(parseInt(@walk_frame)/4)]

      rotation = false
      if @vector and @rotate_sprite
        rotation = Math.atan2(@vector.y, @vector.x)
        rotation += Math.PI/2
        #rotation -= (2*Math.PI)/4
        #rotation = -rotation
      if @footprint_img
        if @draw_prints
          @draw_prints = 0
          window.Draw.use_layer 'background'
          window.Draw.image(@footprint_img, @pos[0], @pos[1], 32, 32, rotation)

      window.Draw.use_layer 'entities'
      
      window.Draw.sub_image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size, @sprite_size, offset, rotation)


    die: ->
      if @suit
        corpse = new window.Entities.classes.Thing('a corpse', 'suitcorpse', @pos)
      else
        corpse = new window.Entities.classes.Thing('a corpse', 'corpse', @pos)
      corpse.sprite_size = 48
      corpse.sprite_offset = [0,0]
      @destroy()

  
  window.Entities.classes.SlowWalker = SlowWalker
  window.Entities.classes.SlowSentient = SlowSentient
  window.Entities.classes.SlowColonist = SlowColonist

