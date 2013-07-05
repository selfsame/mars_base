
class Vect2D
  constructor: (@x, @y)->
    @type = 'v'
  to_string: ->
    return ''+@x+','+@y

  operate: (op, thing, apply)->
    value = false
    if op in ['+', '-']
      if typeof thing is 'number'
        return thing
    if typeof thing is 'object'
      if thing.v?
        if op is '='
            nv = new Vect2D(thing.x, thing.y)
            return nv
      if thing.axis?
        value = parseInt(thing.value)
        if thing.axis in ['x','y']
          if op is '+'
            value = @[thing.axis] + value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
          if op is '-'
            value = @[thing.axis] - value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
          if op is '*'
            value = @[thing.axis] * value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
          if op is '/'
            value = @[thing.axis] / value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
          if op is '%'
            value = @[thing.axis] % value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
          if op is '='
            value = value
            if apply
              @[thing.axis] = value
            nv = new Vect2D(@x, @y)
            nv[thing.axis] = value
            return nv
    if typeof thing is 'number'
      value = parseInt(thing)
      if op is '*'
        xx = @x * value
        yy = @y * value
        if apply
          @x = xx
          @y = yy
        return new Vect2D(xx,yy)
      if op is '/'
        xx = @x / value
        yy = @y / value
        if apply
          @x = xx
          @y = yy
        return new Vect2D(xx,yy)
      if op is '%'
        xx = @x % value
        yy = @y % value
        if apply
          @x = xx
          @y = yy
        return new Vect2D(xx,yy)


class AxisNum
  constructor: (@value, @axis)->

    @type = 'axisnum'
  to_string: ->
    return @value+@axis

  operate: (op, thing, apply)->

    m = (k,y)->
      if op is '+'
        return k + y
      if op is '-'
        return k - y
      if op is '*'
        return k * y
      if op is '/'
        return k / y
      if op is '%'
        return k % y
      if op is '='
        return y
      if op is '=='
        return k is y

    if op in ['+', '-']
      if typeof thing is 'number'
        return new AxisNum m(@value, thing), @axis
    if typeof thing is 'object'
      if thing.axis? and thing.axis is @axis
        
        return new AxisNum m(@value, thing.value), @axis
      if thing.type is 'v'
        return m(@value, thing[@axis])


class EntityRef
  constructor: (entity)->
    @type = 'e'
    @e = entity.EID
    @v = new Vect2D(entity.tile_pos[0], entity.tile_pos[1])

    @s = entity.nombre
  to_string: ->
    return ''+@e
  operate: (op, thing, apply)->
    if op is '=='
      console.log 'EntityRef == ', thing
      if typeof thing is 'string'
        if thing is @s
          return true
      if typeof thing is 'object'
        if thing.e?
          return (@e is thing.e)
    else
      if typeof thing is 'object' and thing.type is 'v'
        return @v.operate(op, thing)

class RegisterStack
  constructor: ()->
    @array = []
    @type = 'stack'
  to_string: ->
    return '[x'+@array.length+']'

  

$(window).ready ->
  window.SlowDataTypes =
    Vect2D: Vect2D
    AxisNum: AxisNum
    EntityRef: EntityRef
    RegisterStack: RegisterStack 



