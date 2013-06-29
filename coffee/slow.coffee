$(window).ready ->

  window.Scripter = 
    init: ->
      @watch = false
      window.Events.add_listener(@)
      @inspect = $('<div id="inspect"></div>')
      $('#UI_overlay').append @inspect

    show_vars: ->
      if @watch and @watch.script_vars
        @vars.html ''
        for i in [0..4]
          @vars.append $('<div class="column"></div>')

        i = 0
        for type of @watch.script_vars
          $(@vars.children()[i]).append '<p>'+type+'</p>'
          for item in @watch.script_vars[type]
            if item is undefined
              item = ''
            $(@vars.children()[i]).append $('<div class="entry">'+item+'</div>')
          i += 1

    show: (thing)->
      @watch = thing
      @inspect.html ''
      @inspect.append '<p>'+thing.nombre+'</p>'
      @inspect.append '<p>'+thing.tile_pos+'</p>'
      if thing.script and thing.parsed_script
        @inspect.css('visibility', 'visible')

        @vars = $('<div class="script_vars"></div>')
        @show_vars()
        @inspect.append @vars

        @script = $('<div class="script_display"><pre><code></pre></code></div>')
        @code = @script.find('code')
        @inspect.append @script
        parsed = thing.parsed_script

        make_block = (obj)->
          block = $('<span class="block"></span>')
          if obj.begin
            block.append obj.begin
          for part, i in obj.block
            if part.type in ['action', 'routine', 'conditional']

              sub = make_block(part)
 
              block.append sub
            else
              block.append $('<span class="block statement">'+obj.literals[i]+'</span>')
          if obj.end

            block.append obj.end
          return block

        console.log parsed
        for routine in parsed
          @code.append make_block routine
        
      else
        @script = false

    update: ->
      if @watch and @script and @watch.parser
        @code.find('.block').removeClass 'current'
        start = @code
        for i in [0..@watch.parser.block_level]
          index = @watch.parser.code_index[i]
          start = $(start.children('.block')[index])
        start.addClass 'current'


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
      @script = false
        
        
      @script_vars =
        i:[]
        f:[]
        s:[]
        v:[]
        e:[]



      for i in [0..9]
        @script_vars.i.push undefined
        @script_vars.f.push undefined
        @script_vars.s.push undefined
        @script_vars.v.push undefined
        @script_vars.e.push undefined


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

    run_script: (script)->
      @script = script
      try
        @parsed_script = window.slow_parser.parse @script
      catch error
        console.log 'parse error: ', error, @script
      console.log @parsed_script
      if @parsed_script
        @parser = new SlowParser(@, @parsed_script)

    walk_path: ->
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
          return true
      else
        @move(1)
      return false

    _wander: (args = [])->

      if not args[0]
        amount = 10
      else
        amount = args[0]
      
      if not @path or not @target
        @target = @get_random_tile(amount)
        @path_to @target
      if @walk_path()
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
      @scope = false
      @scope_stack = []
      @code_index = [0]
      @block_level = 0
      @routines = {}
      for r in @json
        @routines[r.action] = r

    enter_block: (block)->
      
      @block_level += 1
      if @code_index.length-1 < @block_level
        @code_index.push 0
      @code_index[@block_level] = 0

      @scope = block
      @scope_stack.push block
      console.log 'ENTERING ', block.type, @code_index, '|', @block_level

    leave_block: ()->
      @code_index[@block_level] = 0
      scope = @scope
      @block_level -= 1
      #@code_index[@block_level] += 1
      console.log 'Leaving ', scope.type, @code_index, '|', @block_level
      if @block_level is 0
        @scope = false #top level, should find main
        @code_index[@block_level] = 0
      else
        @scope = @scope_stack.pop()
      



    exec: ->
      if not @scope
        if @routines['main']
          @enter_block @routines['main']
          

      if @scope
        lines = @scope.block
        if lines.length > @code_index[@block_level]
          @run_statement lines[@code_index[@block_level]]
        else
          @leave_block()


    run_statement: (line)->
      if line.type? and line.type in ['conditional']
        @enter_block line
        return
      index = 0
      parts = line.length
      pattern = false



      funct = false
      register = false
      assign = false
      value = undefined
      value_found = false

      args = false
      vars = []

      # determine the type of statement being executed
      # var, function call, if, interrupt

      first = line[0]
      
      if typeof first isnt 'object'
        console.log 'ERROR parsing first token: ', first

      if first.type is 'word'
        pattern = 'call'
        funct = first.value

      if first.type is 'memory'
        pattern = 'assign'
        register = first

      for part, i in line
        if i isnt 0 #we allready used the first token
          if pattern is 'call' and args is false

            if part.type is 'enclosure'
              args = []

              #here is where we would be calling an evaluate for getting results from math/groupings
              for subpart in part.value
                args.push @untoken(subpart)

          else if pattern is 'assign'
            
            if not assign
              if part.type is 'assignment'
                assign = part.value
            else if value_found is false
                remains = line.slice(i,line.length)
                value = @calculate remains
                value_found = true


          else
            console.log 'parsing leftover: ', part.type, part.value

      if pattern is 'call'
        if not args
          args = []
        v = @self['_'+funct]
        if @self['_'+funct]? and typeof @self['_'+funct] is 'function'
          if @self['_'+funct](args)
            @code_index[@block_level] += 1
            console.log 'STATEMENT: ', @code_index, @code_index, '|', @block_level

      if pattern is 'assign'
        if register and assign and value
          v = @self.script_vars[register.slot][register.index] 
          if assign is '+='
            v += value
          else if assign is '-='
            v -= value
          else if assign is '/='
            v /= value
          else if assign is '*='
            v *= value
          else   
            v = value
          @store_var register, value
          window.Scripter.show_vars()
        @code_index[@block_level] += 1

        console.log 'STATEMENT: ', @code_index, '|', @block_level



    store_var: (reg, value)->
      if reg.slot is 'i'
        value = parseInt(value)
      if reg.slot is 'f'
        value = parseFloat(value).toFixed(2)
      @self.script_vars[reg.slot][reg.index] = value


    untoken: (obj)->
      if typeof obj isnt 'object'
        return undefined
      if obj.type is 'enclosure'
        return @calculate obj.value
      if obj.type is 'number'
        return obj.value
      if obj.type is 'memory'
        return @self.script_vars[obj.slot][obj.index]
      return undefined

    calculate: (tokens)->
      report = ''
      for t in tokens
        report += t.value+' '
      console.log 'calc:', report
      value = undefined
      valid = false
      operator = false
      for token in tokens
        

        if value is undefined
          if not valid
            value = @untoken(token)

            valid = true
          else
            return undefined
        else if not operator
          if token.type is 'operator'
            operator = token.value

          else

            return undefined
        else
          next = @untoken(token)
          if operator is '+'
            value += next
          else if operator is '-'
            value -= next
          else if operator is '*'
            value *= next
          else if operator is '/'
            value /= next
          else if operator is '%'
            value %= next
          operator = false
      console.log '  = ', value
      return value
















  window.Entities.classes.SlowEntity = SlowEntity
  window.Entities.classes.SlowWalker = SlowWalker
  window.Entities.classes.Scripted = Scripted
