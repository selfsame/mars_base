window.phrases =
  'help': ['help!', 'hey guys?', 'this is bad.', 'frack!', 'not good', 'oh no!']
  'found': ['I see a $1', 'look, a $1']
  'need': ['I need a $1', 'anybody seen a $1?']
  'location': ['the $1 is over there', 'I saw a $1', 'look, $1', 'here is the $1']
  'forget': ['no $1 here']
  'greet': ['Nice to meet you, $1']
  'sup': ['what are you up to?', "what's up?", 'hey $1']
  'follow':['follow me', 'come, $1', 'I need a hand']


class Entity
  constructor: (@nombre='thing', @image='sprite', @pos=[0,0])->
    
    @draw_hooks = []

    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
    @debug = []
    @half_size = 16
    @no_path = false
    @init()
    @sprite_size = 32
    @sprite_offset = [0,0]
    @claimed = false
    @state_que = []
    @hidden = false
  init: ->
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
  show: ->
    if @hidden
      @hidden = false
  draw: ->
    window.Draw.use_layer 'entities'
    window.Draw.image(@image, @pos[0]+@sprite_offset[0], @pos[1]+@sprite_offset[0], @sprite_size, @sprite_size)
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


class Airtank extends Thing
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
  

class Walker extends Entity
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
    window.Entities.sentient.push @
    window.Entities.sentient_hash.add @
    @setup()

  setup: ()->

  draw: ->
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

  # State functions

  idle: ->
    if @state_que? and @state_que.length > 0
      use = @state_que.pop(0)
      @state = use
      return
    @target = @get_random_tile(10)
    @path_to @target

  wait: ->
    @wait_time += @delta_time
    #console.log @wait_time
    if @wait_time > 600
      @wait_time = 0
      @state = 'idle'

  moving: ->
    if not @path? or @path.length is 0
      @state = 'wait'
      return
    tilesize = window.Map.tilesize

    p1 = @path[0][0]*tilesize
    p2 = @path[0][1]*tilesize
    @vect_to_target = new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0)
    @dist_to_target = @vect_to_target.length()
    @target_vect = @normalize_vector( @vect_to_target )



    @vector = Vector.lerp(@vector, @target_vect, @turn_speed)
    near = 10
    if @pos[0] > p1-near and @pos[0] < p1+near and @pos[1] > p2-near and @pos[1] < p2+near
      #@tile_pos = @path[0]
      @path = @path.splice(1,@path.length)
      @velocity = .1
      if @path.length is 0

        @state = 'wait'
        return
    else
      @move(1)

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
        if l > 6
          avoid = avoid.unit().multiply(6)
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
      v = v.divide(count).multiply(.11)
      return v
    return false


  wait: ->
    @wait_time += @delta_time
    #console.log @wait_time
    @move(.8)
    if @wait_time > 600
      @wait_time = 0
      @state = 'idle'

  n_tiles_away: (p1,p2, n)->
    if p1[0] > p2[0]-n and p1[0] < p2[0]+n and p1[1] > p2[1]-n and p1[1] < p2[1]+n
      return true




class Talker extends Walker
  init_voice: ()->
    console.log 'init v'
    @voice_que = []
    @hear_que = []
    @draw_hooks.push 'draw_voice'
    @wander_dist = 4
    @conversation_timer = 0
    @conversation_partner = false
    @memory =
      objects:{}
      entities:{}


    
  draw_voice: ()->
    if Math.random() < .2
      @_process()
    if @voice_que? and @voice_que.length > 0
      #@debug.push @voice_que[0]
      @voice_que[0][1] += 1
      phrase = @voice_que[0][0]
      phlen = phrase.length*10 + 10
      window.Draw.use_layer('entities')
      alpha = 1 - @voice_que[0][1]/90
      ymod = alpha * 30 - 30
      font = {fillStyle: 'rgba(0,0,0,'+alpha+')', strokeStyle: 'black',font:'courier', fontsize: 16}
      if @voice_que[0][2] is 'emergency'
        font = {fillStyle: 'rgba(255,0,0,'+alpha+')', strokeStyle: 'red',font:'Comic Sans MS', fontsize: 20}
      window.Draw.draw_box(@pos[0], @pos[1]-20+ymod, phlen, 20, {fillStyle:'rgba(255,255,255,'+alpha+')',strokeStyle:'black',lineWidth:0})
      window.Draw.draw_lines([[@pos[0]+4, @pos[1]+ymod], [@pos[0]+5+4, @pos[1]+7+ymod],[@pos[0]+10+4, @pos[1]+ymod]], {strokeStyle:'transparent',lineWidth:0})
      window.Draw.draw_text(phrase,@pos[0]+5, @pos[1]-5+ymod, font)
      if @voice_que[0][1] > 90
        @voice_que = @voice_que.splice(1,@voice_que.length)
      if @voice_que.length > 4
        @voice_que = @voice_que.splice(1,@voice_que.length)
      
  converse: ()->

    if @conversation_partner
      @conversation_timer += 1
      target = new Vector(@conversation_partner.pos[0],@conversation_partner.pos[1],0)
      me = new Vector(@pos[0],@pos[1],0)

      @vector = Vector.lerp(@vector, target.subtract(me), .001)
    if @conversation_timer > 150
      if Math.random() < .5 and not @follow_target

        follow_target = @conversation_partner

        follow_target.follow_target = @
        follow_target.state = 'follow'
        follow_target.follow_timer = 800
        @say 'follow', follow_target.nombre
        @conversation_partner = false
        @conversation_timer = 0
        @state = 'wander'
        return
      @conversation_partner = false
      @conversation_timer = 0
      @state = 'idle'

  get_phrase: (key)->
    if window.phrases[key]?
      set = window.phrases[key]

      choice = set[parseInt(Math.random()*set.length)]
      if choice?
        return choice #choice

  say: (key, arg1=false, arg2=false)->
    @debug.push @voice_que.length
    if @memory.objects.suit?
      @debug.push @memory.objects.suit.length
    phrase = @get_phrase(key)
    if phrase
      if @voice_que.length < 2
        if key is 'help'
          @voice_que.push [phrase.replace(/[$][1]/g, arg1), 0, 'emergency']
        else
          @voice_que.push [phrase.replace(/[$][1]/g, arg1), 0]
          for guy in window.Entities.sentient
            if guy isnt @ and guy.hear
              guy.hear(@, key, arg1, arg2)



  hear: (entity, key, arg1=false, arg2=false)->
    @hear_que.push [entity, key, arg1, arg2]
    

  _process: ()->
    for talk in @hear_que

      entity = talk[0]
      key = talk[1]
      arg1 = talk[2]
      arg2 = talk[3]
      if not @needs
        @needs = []

      blocked = []
      if key is 'forget'
        if arg1 and arg2
          @_forget arg1, arg2
      if key is 'need'
        if arg1
          if arg1 not in @needs
            @needs.push arg1
          
      if key is 'location'
        if arg1
          if not @memory.objects[arg1]
            @memory.objects[arg1] = [arg2]
            blocked.push arg1
          for mem in @memory.objects[arg1]
            if not (arg2[0] is mem[0] and arg2[1] is mem[1])
              console.log 'learned a location'
              @memory.objects[arg1].push arg2
              blocked.push arg1

      if key is 'greet'
        if arg1 and arg1 is @nombre
          @conversation_partner = entity
          @state_que = []
          @state = 'converse'
          @say 'greet', entity.nombre

      for need in @needs
        if need not in blocked
          if @memory.objects[need] and @memory.objects[need].length > 0
              for mem in @memory.objects[need]
                r = window.Map.get('objects', mem[0], mem[1])
                found = false
                if r and r.length > 0
                  for obj in r
                    if obj.nombre is need
                      found = true
                      @say 'location', need, @memory.objects[need][0]
                      @needs.remove need
                      @hear_que = []
                      return
                    else
                      @_forget need, mem 
      @hear_que = []

    








class Colonist extends Talker
  setup: ->
    @pocket = []
    @suit = false
    @oxygen = 1200 #naked 
    @max_oxygen = @oxygen
    @state = 'idle'
    @init_voice()
    @goal_actions =
      oxygen: ['']
    @walk_frame = 0
  update: (delta)->
    if @vvv
      len = @vvv.length()
      if len > .2

        @walk_frame += len*.25
        if @walk_frame > 12
          @walk_frame = 0

    if @oxygen?
      tile = window.Map.get('floor', @tile_pos[0], @tile_pos[1])

      if tile and tile.built

        @oxygen += 5
      if @oxygen > @max_oxygen
        @oxygen = @max_oxygen
      @oxygen -= 1

      if @oxygen < @max_oxygen*.9
        window.Draw.use_layer 'view'
        w = 32 * (@oxygen / @max_oxygen )
        window.Draw.draw_box(16 + @pos[0]-w*.5, @pos[1]+30, w, 5, {fillStyle:'red',strokeStyle:'rgba('+32-w+','+w+','+w+',.4)',lineWidth:0})
      
      

      if @oxygen < 0
        @die()
        return
    if @follow_target
      @debug.push @nombre+' / '+ @follow_target.nombre
      @follow_timer -= 1
      if @follow_timer <= 0
        @follow_target = false
        @follow_timer = 150

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

    corpse = new Thing('a corpse', 'corpse', @pos)
    corpse.sprite_size = 64
    corpse.sprite_offset = [-32,-32]
    @destroy()

  pause: ->


  idle: ->
    #finish que of states
    @mood = 'busy'
    if @state_que? and @state_que.length > 0

      use = @state_que[0]
      @state_que = @state_que.slice(1,@state_que.length)
      @state = use
      return

    # handle emergencies
    if not @suit
      @want = 'suit'
      @state_que.push 'find_object'
      @state_que.push 'pickup'
      @state_que.push 'wear_suit'
      return
    if @oxygen < @max_oxygen*.9

      if @oxygen < 260
        @state = 'asphyxiation'
        return
      
      if @oxygen < @max_oxygen*.8
        @want = 'airtanks'
        @state_que.push 'find_object'
        @state_que.push 'use_object'
        return
    if @follow_target and @follow_timer? and @follow_timer > 0
      @state = 'follow'
      return
    #figure out what to do
    @mood = 'bored'
    @state = 'work'


  follow: ->
    if not @follow_timer?
      @follow_timer = 150
    if @follow_target
      @path_to @follow_target.tile_pos
    
      

  asphyxiation: ->
    @say 'help'

  use_object: ->
    r = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
    found = false
    if r and r.length > 0
      for obj in r
        if obj.nombre is @want
          
          found = true
          if obj.use
            if obj.use @ #return true if use cycle complete, bad logic
              @state = 'idle'
              @_forget @want, @tile_pos
              return
            else
              return
      if not found
        @_forget @want, @tile_pos
        @state_que = []
        @state = 'idle'
    @state_que = []
    @state = 'idle'


  find_object: ->

    if @memory.objects[@want]? and @memory.objects[@want].length > 0
      list = @memory.objects[@want]
      if Math.random() < .33
        list = list.sort()
      if Math.random() < .33
        list = list.reverse()
      for loc in @memory.objects[@want]
        if @path_to loc
          console.log @path
          @state_que =  ['moving'].concat @state_que
          @state = 'idle'
          return
    @say 'need', @want
    @state_que = []
    @state = 'inventory'
  pickup: ->

    r = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
    found = false
    
    if r and r.length > 0

      for obj in r
        if obj.nombre is @want
          console.log 'pickup', obj.nombre
          @_forget @want, @tile_pos
          @say 'forget', @want, @tile_pos
          found = true       
          r.remove obj
          obj.hide()
          @pocket.push obj
          obj.pos = @pos
          @want = false
          @state = 'idle'

          return

    if not found
      @state_que = []
      @state = 'inventory'
      if @_forget @want, @tile_pos
        @say 'forget', @want, @tile_pos
        @want = false
        return

  _forget: (nombre, pos)->
    if @memory.objects[nombre]
      for loc in @memory.objects[nombre]
            if loc[0] is pos[0] and loc[1] is pos[1]
              @memory.objects[nombre].remove loc
              return true
      
      
  wear_suit: ->

    @suit = true
    @oxygen = 6000
    @max_oxygen = 6000
    @image = 'suitwalk'
    @state = 'idle'
  work: ->
    @state = 'break'
  break: ->
    if Math.random() < .6
      if Math.random() < .3
        @wander_dist = 10
        @state = 'wander'
      else
        @path_to [parseInt(window.Map.width/2+(Math.random()*6)-3), parseInt(window.Map.height/2+(Math.random()*6)-3)]
    else
      near = window.Entities.sentient_hash.get_within @pos, 80
      if near
        for guy in near
          if guy isnt @
            if guy.state in ['idle','wait','break'] and guy.mood? and guy.mood is 'bored'
              if new Vector(guy.pos[0], guy.pos[1], 0).subtract( new Vector(@pos[0], @pos[1], 0) ).length() < 40
                if not @memory.entities[guy.nombre]
                  @memory.entities[guy.nombre] = true
                  @say 'greet', guy.nombre
                  @conversation_partner = guy
                  @state = 'converse'
                  return
                else
                  @say 'sup', guy.nombre
                  @conversation_partner = guy
                  @state = 'converse'
                  return









class Engineer extends Colonist

  work: ->

    if @remove_order
      if @n_tiles_away( @tile_pos, @remove_order.tile_pos, 2 )
        @remove_order.destroy()
        @remove_order = false
      else

    else if @build_order

      if @n_tiles_away( @tile_pos, [@build_order.x, @build_order.y], 2 )
        @build_order.build(@delta_time*3)
        if @build_order.built
          if not @build_order.is_wall()
            window.Map.set("pathfinding", this.x, this.y, 0)
          console.log 'tile built'
          @build_order = false
      else
        console.log 'not close enough to build'
        window.Tiles.under_construction.push @build_order
        @build_order = false
    else
      if window.Tiles and window.Tiles.under_construction and window.Tiles.under_construction.length > 0
        tile = window.Tiles.under_construction[0]
        if @path_to [tile.x,tile.y]
          @build_order = tile
          window.Tiles.under_construction.remove tile
          @state = 'moving'
        else
          obj_in_map = window.Map.get('objects', tile.x, tile.y)
          if obj_in_map and obj_in_map.length
            for obj in obj_in_map
              if obj.no_path
                if not obj.claimed
                  for p in [[-1,0], [1,0], [0,-1], [0,1]]
                    if @path_to [p[0]+tile.x,p[1]+tile.y]
                      @remove_order = obj
                      @state = 'moving'
                      obj.claimed = true
                      return
                #hack, put the constructing tile at the end of the list
                window.Tiles.under_construction.remove tile
                window.Tiles.under_construction.push tile
                @state = 'wander'
                return #if we find a blocking object that is claimed, don't attempt to build
          
        for p in [[-1,0], [1,0], [0,-1], [0,1]]
          if @path_to [p[0]+tile.x,p[1]+tile.y]
            @build_order = tile
            window.Tiles.under_construction.remove tile
            @state = 'moving'
            return

      else
        if Math.random() < .3
          @state = 'inventory'
        else
          @state = 'break'

  inventory: ->
    for i in [-3..3]
      for j in [-3..3]
        objs = window.Map.get('objects', @tile_pos[0]+i, @tile_pos[1]+j)
        if objs
          for obj in objs
              pos = [obj.tile_pos[0], obj.tile_pos[1]]
              if @memory.objects[obj.nombre]
                l = @memory.objects[obj.nombre]
                #l = l.slice(l.length-15, l.length)
                l.push pos


                
              else
                @memory.objects[obj.nombre] = [pos]

    @state = 'wander'

  wander: ->
    @target = @get_random_tile(@wander_dist)
    @path_to @target
  removing_object: ->
    x = parseInt(Math.random()*2)-1
    y = parseInt(Math.random()*2)-1
    x += @remove_order.tile_pos[0]
    y += @remove_order.tile_pos[1]
    @path_to [x,y]







class Hash
  #sparse bucket hash, for quick lookups on entities in range
  constructor: (size)->
    @size = size
    @data = {}
    @members = {}
  add: (obj)->
    if not @members[obj]
      bucket = @pos_to_bucket obj.pos
      @members[obj] = bucket
      if not @data[bucket]
        @data[bucket] = []
      @data[bucket].push obj

  remove_member: (obj)->
    if @members[obj]
      @remove @data[ @members[obj] ], obj
    delete @members[obj]

  pos_to_bucket: (pos)->
    bucket = [parseInt(pos[0] / @size), parseInt(pos[0] / @size)]

  put_in_data: (obj, bucket)->
    if not @data[bucket]
      @data[bucket] = []
    if obj not in @data[bucket]
      @data[bucket].push obj
    @members[obj] = bucket

  update_member: (obj)->
    if @members[obj]?
      bucket = @pos_to_bucket obj.pos
      if not @compare( @members[obj], bucket)
        if @data[@members[obj]]
          without = @remove(@data[@members[obj]], obj)
          if without
            @data[@members[obj]] = without

          @put_in_data obj, bucket

  remove: (listing, obj)->
    index = listing.indexOf(obj)
    if index isnt -1
      listing = listing.splice(index, 1)
    return false
      


  compare: (list1, list2)->
    if list1[0] is list2[0] and list1[1] is list2[1]
      return true
    return false



  # lookup functions

  get_within: (pos, dist)->
    bucket = @pos_to_bucket pos
    b_radius = Math.floor(dist / @size)
    if b_radius is 0
      b_radius = 1
    results = []
    for i in [bucket[0]-b_radius .. bucket[0]+b_radius]
      for j in [bucket[1]-b_radius .. bucket[1]+b_radius]
        if @data[[i,j]]?
          results = results.concat @data[[i,j]]
    if results.length > 0
      return results
    else
      return false

  get_closest: (pos, obj_list)->



window.Entities =
  init: ->
    window.Events.add_listener( @ )
    @classes =
      Entity: Entity
      Walker: Walker
      Thing: Thing
      Engineer: Engineer
      Airtank: Airtank

    @path_finder = new PF.JumpPointFinder()
    #@path_finder = new PF.AStarFinder()
    @sentient = []
    @objects = []

    @sentient_hash = new Hash(64)
    @objects_hash = new Hash(64)
 


  update: (delta)->
    
    if @objects?
      for thing in @objects
        thing._update(delta)
    if @sentient?
      for thing in @sentient
        if thing isnt undefined
          thing._update(delta)
  get_path: (x,y,x2,y2)->
      grid = new PF.Grid(window.Map.width, window.Map.height, window.Map.arrays['pathfinding'])
      try  
        return @path_finder.findPath(x, y, x2, y2, grid)
      catch error
        return false
  add_class: (name, ancestor='Entity')->
    # This constructs a class and allows inheritance.
    if @classes[name]?
      return false
    if @classes[ancestor]?
      eval "this.classes[name] = (function(_super) {
          __extends("+name+", _super);
          function "+name+"() {
            return "+name+".__super__.constructor.apply(this, arguments);
          }
          return "+name+";
        })(this.classes[ancestor]);"

      return @classes[name]


$(window).ready ->
  window.Draw.add_image('tracks', "./textures/tracks.png")
  window.Draw.add_image('prints', "./textures/prints.png")
  window.Draw.add_image('colonist', "./textures/astronauts/colonist.png")

  window.Draw.add_image('shadow', "./textures/astronauts/shadow.png")
  window.Draw.add_image('engineer', "./textures/astronauts/engineer.png")
  #objects
  window.Draw.add_image('rock', "./textures/objects/rock.png")
  window.Draw.add_image('wrench', "./textures/objects/wrench.png")
  window.Draw.add_image('launchpad', "./textures/objects/launchpad.png")
  window.Draw.add_image('corpse', "./textures/astronauts/corpse.png")

  window.Draw.add_image('crate', "./textures/objects/crate_closed.png")


  window.Draw.add_image('airtanks', "./textures/objects/airtanks.png")
  window.Draw.add_image('emptytanks', "./textures/objects/emptytanks.png")
  window.Draw.add_image('solarpanel', "./textures/objects/solarpanel.png")
  window.Draw.add_image('wrench', "./textures/objects/wrench.png")
  

  window.Draw.add_image('barewalk', "./textures/astronauts/colonist_bare_walk.png")
  window.Draw.add_image('suitwalk', "./textures/astronauts/colonist_suit_walk.png")

  window.Entities.init()
