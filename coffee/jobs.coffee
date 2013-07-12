




class Job
  constructor: (@type='default')->
    @instructions = []
    @timer = 0
    @assigned = false
    @timeout = 10000
    @assigned = false
    @index = 0
  get_instruction: ()->
    if @index > @instructions.length
      @index = 0
      return undefined
    else
      @index += 1
      return @instructions[@index-1]
  to_string: ->
    return 'job: '+@type
  update: (delta)->
    if @assigned
      @timer += delta
      if @timer > @timeout
        @assigned = false
        window.Jobs.fail(@)
  complete: ()->
    if @is_done()
      window.Jobs.complete(@)
    else
      window.Jobs.fail(@)
  is_done: ()->
    #usually overwritten
    return true

  #helper functions for creating instructions
  add_instruction: (thing)->
    if typeof thing is 'string'
      @instructions.push thing
      return true
    if typeof thing is 'number'
      @instructions.push thing
      return true
    if thing instanceof Array
      if thing.length is 2
        @instructions.push new window.SlowDataTypes.Vect2D(thing[0], thing[1])
        return true
    if typeof thing is 'object'
      if thing.EID?
        @instructions.push new window.SlowDataTypes.EntityRef( thing )
        return true
    return false

  pos_match: (pos1, pos2)->
    if pos1? and pos2? and pos1 instanceof Array and pos2 instanceof Array and pos1.length is 2 and pos2.length is 2
      if pos1[0] is pos2[0] and pos1[1] is pos2[1]
        return true
    return false

  pos_match_near: (pos1, pos2)->
    if pos1? and pos2? and pos1 instanceof Array and pos2 instanceof Array and pos1.length is 2 and pos2.length is 2
      if Math.abs(pos1[0] - pos2[0]) <= 1  and Math.abs(pos1[1] - pos2[1]) <= 1 
        return true
    return false


window.Jobs =
  init: ->
    window.Events.add_listener(@)
    @job_class = Job
    @open_jobs = []
    @assigned_jobs = []
  update: (delta)->
    for job in @assigned_jobs
      if job?
        job.update(delta)

  fail: (job)->
    job.timer = 0
    job.index = 0
    if job in @assigned_jobs
      @assigned_jobs.remove job
    if job not in @open_jobs
      @open_jobs.push job
  complete: (job)->
    if job in @assigned_jobs
      if job?
        @assigned_jobs.remove job

  get_job: (entity)->
    @update_listings()
    job = @open_jobs.pop()
    if job
      entity.job = job
      job.assigned = entity
      @assigned_jobs.push job
      return job


  add_job: (job)->
    @open_jobs.push job

  update_listings: ()->
    window.Tiles.under_construction.reverse()
    for tile in window.Tiles.under_construction
      job = new Job('build')
      job.tile = tile
      job.instructions.push new window.SlowDataTypes.Vect2D(tile.x, tile.y)
      job.is_done = ()->
        console.log 'job.is_done: ', @tile
        if @tile and @tile.built
          return true
        return false

      @open_jobs.push job
    window.Tiles.under_construction = []




$(window).ready ->
  Vect2D =   window.SlowDataTypes.Vect2D
  AxisNum =   window.SlowDataTypes.AxisNum
  EntityRef =   window.SlowDataTypes.EntityRef
  RegisterStack =   window.SlowDataTypes.RegisterStack
  window.Jobs.init()



