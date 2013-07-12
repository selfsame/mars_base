class Entity
    constructor: (@nombre='thing', @image='sprite', @pos=[0,0])->
      @EID = window.get_unique_id()
      @props = {name:@nombre}
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
      @friction = .95
      @flags = {}

      @layout = [[0]];

      
      @init()
      @init_2()
      @setup_1()
      

    init: ->
    init_2: ->
    setup_1: ->
      
    __update: (delta)->
      @pos_to_tile_pos()
      @delta_time = delta
      @total_time += delta
      @frame_count += 1
      @move(@friction)
      #if @['_'+@state]?
      #  @['_'+@state]()
      if not @hidden
        @draw()
      @update(delta)
      @update_2()

    move: ->

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
    update_2: ->

    pos_to_tile_pos: ()->
      if @pos?
        @tile_pos = [parseInt((@pos[0]+@half_size)/window.Map.tilesize), parseInt((@pos[1]+@half_size)/window.Map.tilesize)]

    __destroy: ()->
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

    destroy: ()->
      @__destroy()

class Thing extends Entity

    init: ->
      @attach_to_map()

    attach_to_map: (tpos=false)->
      if tpos
        @pos = [tpos[0]*32, tpos[1]*32]
      else
        @pos = [@pos[0], @pos[1]]
      @pos_to_tile_pos()
      tpos = @tile_pos
      @show()
      window.Entities.objects.push @
      window.Entities.objects_hash.add @
      if @grid_area
        for i in [@grid_area[0]..@grid_area[1]]
          for j in [@grid_area[2]..@grid_area[3]]
            obj_in_map = window.Map.get('objects', tpos[0]+i, tpos[1]+j)
            if not obj_in_map
              window.Map.set('objects', tpos[0]+i, tpos[1]+j, [@])
            else 
              if @ not in obj_in_map
                obj_in_map.push @
      else
        obj_in_map = window.Map.get('objects', tpos[0], tpos[1])
        if not obj_in_map
          window.Map.set('objects', tpos[0], tpos[1], [@])
        else 
          if @ not in obj_in_map
            obj_in_map.push @
      if @no_path
        window.Map.set 'pathfinding', @tile_pos[0], @tile_pos[1], 1


    detach_from_map: ()->
      @hide()
      window.Entities.objects.remove @
      window.Entities.objects_hash.remove @
      if @grid_area
        for i in [@grid_area[0]..@grid_area[1]]
          for j in [@grid_area[2]..@grid_area[3]]
            obj_in_map = window.Map.get('objects', @tile_pos[0]+i, @tile_pos[1]+j)
            if obj_in_map and obj_in_map.length > 0
              obj_in_map.remove @
              if obj_in_map.length is 0
                window.Map.set('objects', @tile_pos[0]+i, @tile_pos[1]+j, 0)
      else
        obj_in_map = window.Map.get('objects', @tile_pos[0], @tile_pos[1])
        if obj_in_map and obj_in_map.length > 0
          obj_in_map.remove @
          if obj_in_map.length is 0
            window.Map.set('objects', @tile_pos[0], @tile_pos[1], 0)
      if @no_path
        window.Map.set 'pathfinding', @tile_pos[0], @tile_pos[1], 0


class Hack
  constructor: ->

class Hash extends Hack
  #sparse bucket hash, for quick lookups on entities in range
  constructor: (size)->
    @size = size
    @data = {}
    @members = {}
  add: (obj)->
    if not @members[obj.EID]
      bucket = @pos_to_bucket obj.pos
      @members[obj.EID] = bucket
      if not @data[bucket]
        @data[bucket] = []
      @data[bucket].push obj
      #console.log '+ ', obj
    else
      console.log 'cant add to hash: ', obj

  remove: (obj)->

    if @members[obj.EID]
      bucket = @members[obj.EID]
      @_remove @data[ @members[obj.EID] ], obj
      delete @members[obj.EID]


  pos_to_bucket: (pos)->
    bucket = [parseInt(pos[0] / @size), parseInt(pos[1] / @size)]

  put_in_data: (obj, bucket)->
    if not @data[bucket]
      @data[bucket] = []
    if obj not in @data[bucket]
      @data[bucket].push obj
    @members[obj.EID] = bucket

  update_member: (obj)->
    if @members[obj.EID]?
      bucket = @pos_to_bucket obj.pos
      if not @compare( @members[obj.EID], bucket)
        if @data[@members[obj.EID]]
          without = @_remove(@data[@members[obj.EID]], obj)
          if without
            @data[@members[obj.EID]] = without

          @put_in_data obj, bucket

  _remove: (listing, obj)->
    index = listing.indexOf(obj)
    if index isnt -1
      listing = listing.splice(index, 1)
    return false
      


  compare: (list1, list2)->
    if list1[0] is list2[0] and list1[1] is list2[1]
      return true
    return false



  # lookup functions

  get_within: (pos, dist, filter=false)->
    bucket = @pos_to_bucket pos
    b_radius = Math.floor(dist / @size)
    #console.log 'within:    bucket=', bucket
    #console.log '           radius=', b_radius
    if b_radius is 0
      b_radius = 1
    results = []
    for i in [bucket[0]-b_radius .. bucket[0]+b_radius]
      for j in [bucket[1]-b_radius .. bucket[1]+b_radius]
        if @data[[i,j]]?
          if filter
            for obj in @data[[i,j]]
              if obj.nombre is filter
                results.push obj
          else
            results = results.concat @data[[i,j]]
    if results.length > 0
      return results
    else
      return false

  get_closest: (pos, obj_list)->



window.Entities =
  init: ->
    window.Events.add_listener( @ )
    @classes = {}

    @path_finder = new PF.JumpPointFinder({allowDiagonal: false, dontCrossCorners:true})
    #@path_finder = new PF.AStarFinder()
    @sentient = []
    @objects = []

    @sentient_hash = new Hash(64)
    @objects_hash = new Hash(64)
 
    @classes.Entity = Entity
    @classes.Thing = Thing


  update: (delta)->
    
    if @objects?
      for thing in @objects
        thing.__update(delta)
    if @sentient?
      for thing in @sentient
        if thing isnt undefined
          thing.__update(delta)
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

  object_from_UID: (id)->
    for thing in @objects
      if thing.UID is id
        return thing
    return false


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
  window.Draw.add_image('suitcorpse', "./textures/astronauts/colonist_suit_dead.png") 
  window.Draw.add_image('crate', "./textures/objects/crate_closed.png")


  window.Draw.add_image('airtanks', "./textures/objects/airtanks.png")
  window.Draw.add_image('emptytanks', "./textures/objects/emptytanks.png")
  window.Draw.add_image('solarpanel', "./textures/objects/solarpanel.png")
  window.Draw.add_image('wrench', "./textures/objects/wrench.png")
  window.Draw.add_image('door', "./textures/objects/door.png")
  window.Draw.add_image('locker', "./textures/objects/locker.png")
  

  window.Draw.add_image('barewalk', "./textures/astronauts/colonist_bare_walk.png")
  window.Draw.add_image('suitwalk', "./textures/astronauts/colonist_suit_walk.png")

  window.Draw.add_image('door_h', "./textures/objects/door_h.png")
  window.Draw.add_image('door_v', "./textures/objects/door_v.png")

  window.Entities.init()
