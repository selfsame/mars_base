class Entity
  constructor: (@name='thing', @image='sprite', @pos=[0,0])->
    @init()
    @debug = []
  init: ->
  _update: ->
    @draw()
    @update()
  draw: ->
    window.Draw.use_layer 'entities'
    window.Draw.image(@image, @pos[0], @pos[1])
  update: ->

class Walker extends Entity
  init: ->
    @state = 'idle'
    @speed = 2.5
    @turn_speed = .02
    @target = 0
    @path = 0
    @vector = @normalize_vector( new Vector(0,1,0))
    @new_vector = false
    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
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
  _update: (delta)->
    @delta_time = delta
    @total_time += delta
    @frame_count += 1
    if @[@state]?
      @[@state]()

    @draw()
    @update()
  draw: ->
    
    

    @draw_sprite()

    window.Draw.context.fillStyle = 'white'
    #window.Draw.draw_text(@state, @pos[0], @pos[1]-18, {fillStyle: 'white', font:'16px courier'})
    #for s, i in @debug
    #  window.Draw.draw_text(s, @pos[0]+18, @pos[1]+i*18, {fillStyle: 'white', font:'16px courier'})
    @debug = []
    if @target
      x = @target[0]*window.Map.tilesize
      y = @target[1]*window.Map.tilesize
      #window.Draw.draw_box(x, y, 32, 32, {fillStyle:'transparent',strokeStyle:'magenta',lineWidth:1})

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

  normalize_vector: (vector)->
    len = vector.length()
    vector = vector.unit().multiply(@speed)
    return vector

  # state functinos

  idle: ->

    @target = @get_random_tile(10)
    path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], @target[0], @target[1])
    if path
      @path = path
      @state = 'moving'

  wait: ->
    @wait_time += @delta_time
    #console.log @wait_time
    if @wait_time > 600
      @wait_time = 0
      @state = 'idle'
  rotating: ->
    
    @wait_time += @delta_time

    #find the radians between the two vectors
    p = Math.PI
    r1 = Math.atan2(@old_vector.y, @old_vector.x)+p
    r2 = Math.atan2(@new_vector.y, @new_vector.x)+p
    if r1 > r2
      r = r1-r2
    else
      r = r2 - r1
    @rotate_speed = r * 300

    if @wait_time > @rotate_speed
      @wait_time = 0
      @vector = @new_vector
      @state = 'moving'
      return
    #console.log 'rotating', @name, @wait_time
    fraction = @wait_time/@rotate_speed
    @vector = Vector.lerp(@old_vector, @new_vector, fraction)
    
  moving: ->
    tilesize = window.Map.tilesize
    @tile_pos = [parseInt((@pos[0])/window.Map.tilesize), parseInt((@pos[1])/window.Map.tilesize)]
    p1 = @path[0][0]*tilesize
    p2 = @path[0][1]*tilesize
    if @pos[0] > p1-@speed and @pos[0] < p1+@speed and @pos[1] > p2-@speed and @pos[1] < p2+@speed
      @pos = [p1,p2]
      @tile_pos = @path[0]
      @path = @path.splice(1,@path.length)
      @velocity = .1
      if @path.length is 0
        @target = 0
        @state = 'wait'
        return
      @new_vector = @normalize_vector( new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0) )
      @old_vector = @vector
      @state = 'rotating'
    else
      @velocity *= 1.1
      if @velocity > 1.0
        @velocity = 1.0
      @pos[0] += @new_vector.x*@velocity
      @pos[1] += @new_vector.y*@velocity
    
class Wanderer extends Walker
  moving: ->
    if not @path? or @path.length is 0
      @state = 'wait'
      return
    tilesize = window.Map.tilesize
    @tile_pos = [parseInt((@pos[0])/window.Map.tilesize), parseInt((@pos[1])/window.Map.tilesize)]
    p1 = @path[0][0]*tilesize
    p2 = @path[0][1]*tilesize

    @vect_to_target = new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0)
    @dist_to_target = @vect_to_target.length()
    @target_vect = @normalize_vector( @vect_to_target )

    @vector = Vector.lerp(@vector, @target_vect, @turn_speed)

    near = 10
    if @pos[0] > p1-near and @pos[0] < p1+near and @pos[1] > p2-near and @pos[1] < p2+near

      @tile_pos = @path[0]
      @path = @path.splice(1,@path.length)
      @velocity = .1
      if @path.length is 0
        @target = 0
        @state = 'wait'
        #@vector = @vector.negative()
        return

    else

      @move(1)

  move: (friction=.95)->
    @vector = @vector.multiply(.90)
    if not @vvv
      @vvv =  new Vector(0,0,0)

    
    if not @dist_to_target
      return
    #if @dist_to_target < 32
    #  friction = .8 + (.2 * (@dist_to_target/32) )
    #console.log friction

    #check if we overshot
    p = Math.PI + Math.PI/2
    r1 = Math.atan2(@vector.y, @vector.x)+p
    r2 = Math.atan2(@vect_to_target.y, @vect_to_target.x)+p
    if r1 > r2
      r = r1-r2
    else
      r = r2 - r1

    if r > .9

      r = .9

    if r > .05
      friction = (1-r*.2)
    

    @vvv = (@vvv).multiply(friction)
    @vvv = @vvv.add(@vector.multiply(.2))
    
    if @vvv.length() > @speed
      @vvv = @normalize_vector(@vvv)
    if @vvv.length() > @speed/3
      if @frame_count%18 is 0
        @draw_prints = 1
    @pos[0] += @vvv.x
    @pos[1] += @vvv.y
    

  wait: ->
    @wait_time += @delta_time
    #console.log @wait_time
    @move(.8)
    if @wait_time > 600
      @wait_time = 0
      @state = 'idle'

class Fancy extends Wanderer
  draw_sprite: ()->
    rotation = false
    i = 0
    j = 0
    if @vvv
      rotation = Math.atan2(@vvv.y, @vvv.x)
      rotation += Math.PI
      #@debug.push 'r: '+rotation.toFixed(2)
      step = (2*Math.PI) / 15
      rot = Math.abs(parseInt(rotation/step) )

      i = Math.floor(rot/5)
      j = rot%4
      #j = 3-j
      #i = 3-i
      #console.log  i, j
      rotation += Math.PI/2

    if @footprint_img
      if @draw_prints
        @draw_prints = 0
        window.Draw.use_layer 'background'
        window.Draw.image(@footprint_img, @pos[0], @pos[1], 32, 32, rotation)

    window.Draw.use_layer 'entities'
    x = @pos[0]+@sprite_offset[0]
    y = @pos[1]+@sprite_offset[0]
    window.Draw.image('shadow', @pos[0]-6, @pos[1]+16, 32, 16)
    window.Draw.sub_image(@image, x,y+@sprite_offset[1], @sprite_size, @sprite_size, 128, offset=[i,j])

  wait: ->
    @wait_time += @delta_time
    #console.log @wait_time
    if @wait_time > 300
      @wait_time = 0
      @state = 'jump'
      @jump_v = -3
  jump: ->
    @jump_v += .1
    @sprite_offset[1] = @sprite_offset[1] + @jump_v
    if @jump_v > 3
      @jump_v = 3
      @state = 'idle'
      @sprite_offset[1] = 0
    







window.Entities =
  init: ->
    window.Events.add_listener( @ )
    @classes =
      Entity: Entity
      Walker: Walker
      Wanderer: Wanderer
    @path_finder = new PF.JumpPointFinder()
    #@path_finder = new PF.AStarFinder()
    @sentient = []
    for i in [0..10]
      x = parseInt(Math.random()*(window.Map.width*window.Map.tilesize))
      y = parseInt(Math.random()*(window.Map.width*window.Map.tilesize))
      advanced = new Fancy('Joe', 'testy', [x,y])
      advanced.speed = 1.5
      advanced.sprite_offset = [-16, 0]
      advanced.sprite_size = 48
      @sentient.push advanced


  update: (delta)->
    if @sentient?
      for thing in @sentient
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
  window.Draw.add_image('tracks', "./textures/tracks.png");
  window.Draw.add_image('prints', "./textures/prints.png");
  window.Draw.add_image('testy', "./textures/astronauts/astrosheet.png");
  window.Draw.add_image('shadow', "./textures/astronauts/shadow.png");
  window.Entities.init()
