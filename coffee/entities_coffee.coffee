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
    else
      console.log 'cant add to hash: ', obj

  remove_member: (obj)->

    if @members[obj.EID]
      bucket = @members[obj.EID]
      @remove @data[ @members[obj.EID] ], obj
    delete @members[obj.EID]


  pos_to_bucket: (pos)->
    bucket = [parseInt(pos[0] / @size), parseInt(pos[0] / @size)]

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
          without = @remove(@data[@members[obj.EID]], obj)
          if without
            @data[@members[obj.EID]] = without

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
 
    window.Draw.create_layer('objects', true);
    window.Draw.persistant_layers.objects.css('z-index', 999999)

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
  

  window.Draw.add_image('barewalk', "./textures/astronauts/colonist_bare_walk.png")
  window.Draw.add_image('suitwalk', "./textures/astronauts/colonist_suit_walk.png")

  window.Draw.add_image('door_h', "./textures/objects/door_h.png")
  window.Draw.add_image('door_v', "./textures/objects/door_v.png")

  window.Entities.init()
