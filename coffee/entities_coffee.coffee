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
    @vector = 0
    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
    @rotation_ready = 0
    window.Draw.make_rotation_sheet @image, 32
  _update: ->
    if @[@state]?
      @[@state]()
    if not @rotation_ready
      if window.Draw.make_rotation_sheet( @image, 32)
        @rotation_ready = 1
    @draw()
    @update()
  get_random_tile: (distance=false)->
    x = parseInt(Math.random()*window.Map.width)
    y = parseInt(Math.random()*window.Map.height)
    return [x,y]
  idle: ->
    @target = @get_random_tile()
    path = window.Entities.get_path(@tile_pos[0], @tile_pos[1], @target[0], @target[1])
    if path
      @path = path

      @state = 'moving'
  moving: ->
    if not @vector
      @vector = new Vector(@path[0][0]-@tile_pos[0], @path[0][1]-@tile_pos[1], 0)
      len = @vector.length()
      @vector = @vector.unit().multiply(@speed)

    @pos[0] += @vector.x
    @pos[1] += @vector.y
    @tile_pos = [parseInt(@pos[0]/window.Map.tilesize), parseInt(@pos[1]/window.Map.tilesize)]
    if @tile_pos[0] is @path[0][0] and @tile_pos[1] is @path[0][1]
      @path = @path.splice(1,@path.length)
      @vector = 0
      if @path.length is 0
        @state = 'idle'
        @vector = 0





window.Entities =
  init: ->
    window.Events.add_listener( @ )
    @classes =
      Entity: Entity
      Walker: Walker
    @path_finder = new PF.JumpPointFinder()
    @sentient = []
    @sentient.push new Walker('bot', 'sprite', [100,100])

  update: ->
    if @sentient?
      for thing in @sentient
        thing._update()
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
  window.Entities.init()
