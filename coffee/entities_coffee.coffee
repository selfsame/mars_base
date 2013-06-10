class Entity
  constructor: (@name='thing', @image='sprite', @pos=[0,0])->
    @init()
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
    @speed = 3
    @target = 0
    @path = 0
    @vector = @normalize_vector( new Vector(0,1,0))
    @new_vector = false
    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
    @wait_time = 0
    @total_time = 0
    @frame_count = 0
    @rotation_ready = 0
    @footprint_img = 'prints'
    window.Draw.make_rotation_sheet @image, 32
  _update: (delta)->
    @delta_time = delta
    @total_time += delta
    @frame_count += 1
    if @[@state]?
      @[@state]()
    if not @rotation_ready
      if window.Draw.make_rotation_sheet( @image, 32)
        @rotation_ready = 1

    @draw()
    @update()
  draw: ->
    
    rotation = false
    if @vector
      rotation = Math.atan2(@vector.y, @vector.x)
      rotation += Math.PI + Math.PI/2
      #rotation -= (2*Math.PI)/4
      #rotation = -rotation

    if @footprint_img
      console.log @total_time
      if @frame_count % 8 is 0
        window.Draw.use_layer 'background'
        window.Draw.image(@footprint_img, @pos[0], @pos[1], 32, 32, rotation)

    window.Draw.use_layer 'entities'
    window.Draw.image(@image, @pos[0], @pos[1], 32, 32, rotation)

    window.Draw.context.fillStyle = 'white'
    window.Draw.draw_text(@state, @pos[0], @pos[1]-18, {fillStyle: 'white', font:'18px arial'})
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

    @target = @get_random_tile(5)
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
    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
    if @tile_pos[0] is @path[0][0] and @tile_pos[1] is @path[0][1]
      @path = @path.splice(1,@path.length)
      if @path.length is 0
        @state = 'wait'
        return
      @new_vector = @normalize_vector( new Vector(@path[0][0]-@tile_pos[0], @path[0][1]-@tile_pos[1], 0) )
      @old_vector = @vector
      @state = 'rotating'
    else
      @pos[0] += @new_vector.x
      @pos[1] += @new_vector.y
    





window.Entities =
  init: ->
    window.Events.add_listener( @ )
    @classes =
      Entity: Entity
      Walker: Walker
    @path_finder = new PF.JumpPointFinder()
    @sentient = []
    @sentient.push new Walker('bot', 'sprite', [700,700])

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
  window.Entities.init()
