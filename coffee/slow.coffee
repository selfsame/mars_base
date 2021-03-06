$(window).ready ->

  window.Scripter = 
    init: ->
      @watch = false
      @edit_mode = false
      window.Events.add_listener(@)
      @inspect = $('<div id="inspect"></div>')
      $('#UI_overlay').append @inspect
      @vars = $('<div class="script_vars"></div>')
      @inspect.append @vars
      @script = $('<div class="script_display"><div class="linenums"></div><code></code></div>')
      @linenums = @script.find('.linenums')
      for i in [0..200]
        @linenums.append ('<p>'+i+'</p>')
      @code = @script.find('code')
      @editarea = $('<textarea class="tabindent">')
      @messages = $('<div class="messages"></div>')
      @filebuttons = $('<div class="buttonrow"></div>')
      @editbutton = $('<div class="codebutton">edit</div>')

      @saveload = $('<div class="saveload"><input id="file">
        
            <div class="codebutton" id="save">save</div><div class="codebutton" id="load">load</div></div>')
      @filebuttons.append $('<div id="pause"class="codebutton">||</div>
          <div id="step"class="codebutton">|></div>')
      
      @saveload.find('#save').click ()->
        window.Scripter.save_script window.Scripter.saveload.find('input').val()
      @saveload.find('#load').click ()->
        window.Scripter.load_script window.Scripter.saveload.find('input').val()

      @reference = $('<div class="reference"></div>')
      @reference.hide()
      @tileinfo = $('<div class="tileinfo"></div>')
      @tileinfo.hide()
      @inspect.append @messages
      @inspect.append @filebuttons
      @filebuttons.prepend @editbutton
      @filebuttons.append @saveload
      @saveload.css('visibility', 'hidden')
      @inspect.append @script
      @inspect.append @tileinfo
      @inspect.append @reference

      @filebuttons.find('#pause').click ()->
        if not window.pause_code
          window.pause_code = true
          
        else
          window.pause_code = false

      @filebuttons.find('#step').click ()->
        window.next_frame = true
       
          

      @editbutton.data('scripter', @)
      @editbutton.click ->
        scripter = $(this).data('scripter')
        scripter.toggle_edit()

    save_script: (filename)->
      if @watch and @watch.script and filename and filename isnt ''
        filename = 'SLOWCODE'+filename
        script = @editarea.val()
        localStorage[filename] = script
        console.log 'saved: ', localStorage[filename]

    load_script: (filename)->
      if @watch and @watch.script and filename and filename isnt ''
        filename = 'SLOWCODE'+filename
        if localStorage[filename]?
          script = localStorage[filename]
          @editarea.val(script)


    toggle_edit: ->
      if @watch
        if @edit_mode is false
          @inspect.animate {width:510}, 300
          @reference.show()
            
          @editbutton.html 'compile'
          @saveload.css('visibility', 'visible')
          @edit_mode = true
          @editarea.val @watch.script
          @editarea.height @code.height()
          @code.replaceWith @editarea
        else
          @saveload.css('visibility', 'hidden')
          @watch.run_script @editarea.val()
          if @watch.error
            @show( @watch )
          else
            @reference.hide()
            
            @inspect.animate({width:330}, 300)
            @editbutton.html 'edit'
            @edit_mode = false
            @editarea.replaceWith @code
            @show @watch

    make_docs: ->
      @reference.html ''
      if @watch

        for prop of @watch.props
          data = @watch.props[prop]
          v = '?'
          if typeof data is 'object'
            if data.type?
              v = data.type
          else if typeof data is 'string'
            v = 's'
          else if typeof data is 'string'
            v = 's'
          else if typeof data is 'number'
            if '.' in v+''
              v = 'f'
            else
              v = 'i'

          @reference.append '<p class="prop">@'+prop+' = '+v+'</p>'


        for prop of @watch
          if typeof @watch[prop] is 'function'
            if prop[0] is '_' and prop[1] isnt '_'
              args = window.get_function_arg_strings @watch[prop]
              if args
                args.join(', ')
              else
                args = ''
              @reference.append '<p class="funct">'+prop.slice(1)+'( '+args+' )'+'</p>'

    show_vars: ->
      if @watch and @watch.script_vars
        if @vars.children('.column').length > 0
          i = 0
          for type of @watch.script_vars
            column = $(@vars.children('.column')[i])
            for item, j in @watch.script_vars[type]

              if item is undefined
                item = ''
              if typeof item is 'object'
                item = item.to_string()
              $(column.children('.entry')[j]).html item
            i += 1
        else
          @vars.html ''
          for i in [0..4]
            @vars.append $('<div class="column"></div>')

          i = 0
          for type of @watch.script_vars
            $(@vars.children()[i]).append '<p>'+type+'</p>'
            for item in @watch.script_vars[type]

              if item is undefined
                item = ''
              if typeof item is 'object'
                item = item.to_string()
              $(@vars.children()[i]).append $('<div class="entry">'+item+'</div>')
            i += 1

    show: (thing=false)->
      @watch = thing

      @make_docs()


      if thing.script
        @inspect.css('visibility', 'visible')


        @show_vars()

        

      if thing.error
        line = thing.error.line
        column = thing.error.column
        message = thing.error.message
        @code.html @watch.script
        @messages.html message
        @linenums.children().removeClass 'error'
        $(@linenums.children()[line-1]).addClass 'error'

        

      else if thing.script and thing.parsed_script
        $('#inspect').height(900)
        sdo = $('#inspect .script_display').offset()
        ih = @inspect.height()
        avail = ih - sdo.top + 20
        $('#inspect .script_display').height avail

        @script.show()
        @messages.show()
        @vars.show()
        @tileinfo.hide()
        @saveload.show()
        @filebuttons.show()
        @code.html ''
        @messages.html ''
        @linenums.children().removeClass 'error'

        parsed = thing.parsed_script

        make_block = (obj)->
          block = $('<span class="block"></span>')
          if obj.begin
            begin = obj.begin
            if obj.bfirst
              group = ''
              for b in obj.eval
                group += '<span class="word">'+b.literal+'</span>'
              begin = obj.bfirst+group+obj.blast

            head = $('<span class="head">'+begin+'</span>')
            obj._html_head = block
            head.data('codeblock', obj)
            head.click ()->
              console.log 'BLOCK: ', $(this).data('codeblock')
            block.append head
          for part, i in obj.block
            if part.type in ['action', 'routine', 'conditional']

              sub = make_block(part)

              part._html_head = sub
              sub.data('codeblock', part)
              sub.click ()->
                console.log 'BLOCK: ', $(this).data('codeblock')
 
              block.append sub
            else
              statement = $('<span class="block statement"></span>')
              part._html_line = statement
              chars = 0
              for g in part
                statement.append $('<span class="word">'+g.literal+'</span>')
                chars += g.literal.length

              statement.append obj.literals[i].slice(chars)
              block.append statement
          if obj.end

            block.append obj.end
          return block
        for routine in parsed
          @code.append make_block routine

      else
        @script.hide()
        @messages.hide()
        @vars.hide()
        



    update: ->
      if @watch and @script and @watch.parser
        @code.find('.block, .head').removeClass 'current'
        @code.find('.word').removeClass 'chunk'
        @code.find('.block, .head').removeClass 'active_head'

        report = ''
        
        cp = @watch.parser.callpoints
        if cp.length > 0


          for p, i in cp
            if p.call._html_head?
              p.call._html_head.children('.head').addClass 'active_head'
              index = p.index

              statement = $( p.call._html_head.children('.block')[index])
              statement.addClass 'current'
              p.call._html_head.removeClass 'current'

              last_slow_call = p
              last_slow_statement = statement

            report += p.to_string()




          si = last_slow_call.token_index
          
          if si?
            if last_slow_statement.children('.head').length > 0
              word = $(last_slow_statement.children('.head').find('.word')[si])
            else
              word = $(last_slow_statement.find('.word')[si])
            word.addClass 'chunk'
            

        @messages.html   'callpoints:'+ report+' token_index='+si





    show_tile: (x,y)->
      @inspect.css('visibility', 'visible')
      $('#inspect').height('auto')
      @watch = false
      @script.hide()
      @messages.hide()
      @vars.hide()
      @saveload.hide()
      @filebuttons.hide()
      @tileinfo.show()
      @editarea.hide()
      stats = $('<p class="tile_pos">path:'+window.Map.get('pathfinding', x, y)+', '+x+','+y+'</p>')
      obs = window.Map.get('objects', x, y)
      obd = $('<ul id="ob_inspect"></ul>')
      if obs
        for ob in obs
          props = ''
          functs = ''
          for prop of ob
            if ob.hasOwnProperty(prop)
              if typeof prop isnt 'function'
                props += '<p class="smallp">'+prop+' = '+ob[prop]+'</p>'
            else if typeof ob[prop] is 'function'
              functs += '<p class="smallp">'+prop+'()'+'</p>'
          obd.append '<li>'+'<p class="title"><img src="'+window.Draw.images[ob.image].src+'">'+ob.nombre+'</p>'+
            '<div class="ob_props">'+props+'</div>'+'<div class="ob_functs">'+functs+'</div>'+'</li>'

      @tileinfo.html ''
      @tileinfo.append stats
      @tileinfo.append obd


    mouseup: (e)->
      if not $('#UI_overlay').is $(e.target).parents()
        t = window.Events.tile_under_mouse
        p = {x:t[0]*32, y:t[1]*32}
        found = window.Entities.sentient_hash.get_within([p.x,p.y], 32)
        results = []
        for guy in found
          if guy.tile_pos[0] is t[0] and guy.tile_pos[1] is t[1]
            results.push guy
        if results.length > 0
          #console.log 'Selected:', results
          @show results[0]
        else
          @show_tile( t[0], t[1])

  window.Scripter.init()

  Vect2D =   window.SlowDataTypes.Vect2D
  AxisNum =   window.SlowDataTypes.AxisNum
  EntityRef =   window.SlowDataTypes.EntityRef
  RegisterStack =   window.SlowDataTypes.RegisterStack


  

    
  class CallPoint
    constructor: ()->
      @type = 'slow' # or 'native'
      @index = 0
      @call_token = undefined # the parse object that called me
      @call = undefined # the parse block or native object to call
      @call_funct = undefined # the string function name to call
      @call_args = undefined #
      @_return = undefined
      @if_group = false # is true if a condition has been met, and we can ignore consecutive elses
      @token_index = 0


    to_string: ()->

      return @call_funct+' ['+@index+']: '

    inspect: (prefix)->
      console.log prefix, @call_token.literal, '>', @call_funct, @call_args


    return: (result=undefined)->
      if @call_token?
        if result?
          @call_token.result = result
          #console.log '[', @call_token.literal, '.result = ',result,']'
        else
          @call_token.result = @_return


  

  class SlowException
    constructor: (@message)->
      @error = true
    to_string: ->
      'ERROR'

  class ESCAPE
    constructor: ()->
      @escape = true


  class SlowParser
    constructor: (@self, @json)->

      @routines = {}
      for r, i in @json
        r.routine_index = i
        @routines[r.action] = r

      @callpoints = []

    indent: ->
      r = '|'
      for i in [0..@callpoints.length-1]
        r += '  '

      return r

    exec: -> 
      if not window.pause_code or window.pause_code and window.next_frame

        if not @callpoints.get_last()
          if @routines['main']
            cp = new CallPoint()
            cp.type = 'slow'
            cp.call = @routines['main']
            cp.call_funct = 'main'
            cp.index = 0
            @callpoints.push cp
            #console.log 'EOF, creating: ', cp.to_string()

            
        if @callpoints.length > 0
          cp = @callpoints.get_last()

          if cp.type is 'native'
            #console.log 'native cp'
            result = cp.call[cp.call_funct](cp.call_args)
            if result is undefined
              return
            else
              #console.log 'leaving: ', cp.to_string()
              cp.return result
              @callpoints.pop()
          else
            #console.log 'slow cp'
            lines = cp.call.block
            #console.log cp.index+'/'+ lines.length
            if lines.length > cp.index
              target = lines[cp.index]

              result = @run_statement lines[cp.index]
              if typeof result is 'object' and result.escape is true

                return
              else
                cp.index += 1
                cp.token_index = 0
                cp.return result
                if window.pause_code
                  window.next_frame = false


            else
              #console.log 'leaving: ', cp.to_string()
              @recurse_clean_line cp.call.block
              @callpoints.pop()

    recurse_clean_line: (obj)->
      if not obj?
        return

      if obj instanceof Array
        for part in obj
          @recurse_clean_line part
      
      
      if obj.type is 'enclosure'
        for part in obj.value
          @recurse_clean_line part
      if obj.result?
        #console.log obj.type, ':delete result'
        delete obj.result
      if obj.block?
        for part in obj.block
          @recurse_clean_line part
      if obj.eval?
        for part in obj.eval
          @recurse_clean_line part
      if obj.args?
        for part in obj.args
          @recurse_clean_line part

    run_statement: (line)->
      cp = @callpoints.get_last()
      cp.token_index = -1
      if line.type? and line.type in ['conditional']
        
        if line.term is 'if'
          cp.if_group = false


        if cp.if_group is false
          if line.result?
            return true
          if line.term is 'else' and line.eval is ''
            cp.if_group = true
            cp.index += 1


            cp = new CallPoint()
            cp.type = 'slow'  
            cp.call = line
            cp.call_funct = line.term
            cp.call_token = line

            @callpoints.push cp


            return new ESCAPE()
          ev = @calculate( line.eval )
          #console.log line.term + ' is ' , ev
          if ev? and ev.escape?
            return ev
          if ev not in [false, 0, undefined]
            
            cp.if_group = true
            cp.index += 1


            cp = new CallPoint()
            cp.type = 'slow'  
            cp.call = line
            cp.call_funct = line.term
            cp.call_token = line
            @callpoints.push cp
            return new ESCAPE()
          else
            return true
        else
          return true
      else
        if cp.if_group
          cp.if_group = false
      
      first = line[0]
      
      if typeof first isnt 'object'
        console.log 'ERROR parsing first token: ', first
        return true

      if first.type? and first.type in ['reserved']
        if first.value.toLowerCase() is 'delete'
          slot = line[1]
          if slot.type is 'memory'
            @delete_var(slot)
            window.Scripter.show_vars()
            return true
        if first.value.toLowerCase() is 'return'
          result = @calculate line, true

          #console.log @indent() +  "RETURN", result, cp.call_token.literal, cp.call_token.result
          cp = @callpoints.get_last()
          cp.return result
          #console.log @indent() +  "RETURN", result, cp.call_token.literal, cp.call_token.result
          @recurse_clean_line cp.call.block
          
          @callpoints.pop()
          return new ESCAPE()

      cp.token_index = -1
      result = @calculate line, true
      if result? and (result.escape? or result.error?)
        return result
      else
        if @assign
          #console.log @assign, result
          @store_var(@assign, result)
          @assign = false
          window.Scripter.show_vars()

      return result





    store_var: (reg, value)->
      if value is undefined
        value = undefined
      else if reg.slot is 'E'
        if value.e
          value = value
        else
          result = result + ''
      else if reg.slot is 'S'
          if value.s?
            value = value.s
          else if value.to_string?
            value = value.to_string()
          else
            value = value + ''
      else if reg.slot is 'V'
        if value.v?
          value = value.v
        else if value.x?
          value = value
        else
          value = undefined

      else if reg.slot is 'I'
        if typeof value is 'object' or value is true
          value = 1
        else if value is false
          value = 0
        else
          value = parseInt(value)
      else if reg.slot is 'F'
        if typeof value is 'object' or value is true
          value = 1
        else if value is false
          value = 0
        else
          value = parseFloat(value).toFixed(2)

      #console.log reg.slot+reg.index+' = ', value

      @self.script_vars[reg.slot][reg.index] = value

    delete_var: (reg)->
      try
        @self.script_vars[reg.slot][parseInt(reg.index)] = undefined
      catch error
        console.log 'cant delete register ', reg, error


    untoken: (obj, i=0)->
      
      if typeof obj isnt 'object'
        return new ERROR('unknown meaning')
      if obj.result?
        #console.log @indent() +  'cache: ', obj.result
        return obj.result
      if obj.type is 'enclosure'
        return @calculate obj.value
      if obj.type is 'null'
        return undefined
      if obj.type is 'boolean'
        if obj.value is 'true'
          return true
        if obj.value is 'false'
          return false
      if obj.type is 'number'
        return obj.value
      if obj.type is 'string'
        return obj.value
      if obj.type is 'self'
        if @self.props[obj.value]?
          return @self.props[obj.value]
      if obj.type is 'reserved'
        if obj.value.toLowerCase() is 'arg'
          #console.log @indent() +  'ARG', @callpoints.get_last(), @callpoints.get_last().call_args
          return @callpoints.get_last().call_args
        return undefined
      if obj.type is 'memory'
        if obj.index is '&'
          indx = 10 #the stack register
        else
          indx = parseInt(obj.index)
        mem = @self.script_vars[obj.slot][parseInt(obj.index)]
        return mem
      if obj.type is 'axisnumber'
        return new AxisNum(obj.value, obj.axis)
      if obj.type is 'call'
        #console.log @indent() + 'call: ', obj
        if obj.result?
          #console.log @indent() + 'result cache: ', obj.result, obj
          r = obj.result
          return r

        funct = obj.value.value

        if @self['_'+funct]? and typeof @self['_'+funct] is 'function'

          


          

          args = @calculate obj.args
          if args? and (args.escape? or args.error?)
            return args
          else
            cp = new CallPoint()
            cp.call_args = args
            cp.type = 'native' 
            cp.call_token = obj 
            cp.call = @self 
            cp.call_funct = '_'+funct 
            @callpoints.push cp
            return new ESCAPE()

        else if @routines[funct]?

          

          args = @calculate obj.args
          if args? and (args.escape? or args.error?)
            return args
          else
            cp = new CallPoint()
            cp.call_args = args
            cp.type = 'slow' 
            cp.call_token = obj 
            cp.call = @routines[funct] 
            cp.call_funct = funct 
            @callpoints.push cp
            return new ESCAPE()
        

      return undefined

    calculate: (tokens, top=false)->
      cp = @callpoints.get_last()
      report = ''
      for t in tokens
        report += t.type+' '
      #console.log 'calc:', report
      value = undefined
      valid = false
      operator = false
      for token, i in tokens
        if top
          cp.token_index += 1
        
        if token.type is 'reserved' and token.value is 'return'
          n = 0
        else if not valid
          value = @untoken(token, i)
          if value? and (value.error? or value.escape?)
            return value
          else
            valid = true

        
        else if not operator
          if token.type in ['operator','compare', 'assignment']
            operator = token.value



        else

          next = @untoken(token, i)


          if next? and (next.error? or next.escape?)
            return next
          #console.log value, operator, next
          if typeof value is 'object' and value.operate and operator in ['+','-','*', '/', '%', '=', '==']
            value = value.operate( operator, next )
            if operator is '='
              if tokens[i-2].type is 'memory'
                @assign = tokens[i-2]

          else if operator is '+'
            value += next
          else if operator is '-'
            value -= next
          else if operator is '*'
            value *= next
          else if operator is '/'
            value /= next
          else if operator is '%'
            value %= next

          else if operator is '=='
            value = (value is next)
          else if operator is '<='
            value = (value <= next)
          else if operator is '>='
            value = (value >= next)
          else if operator is '<'
            value = (value < next)
          else if operator is '>'
            value = (value > next)

          else if operator is '&'
            value = (value and next)
          else if operator is '|'
            value = (value or next)

          if operator is '='
            #console.log 'calculating assignment', tokens[i-2]
            if tokens[i-2].type is 'memory'
              #we know we are assigning a var, but need to wait untill all the tokens have been calc'd
              #console.log value, '=', next
              value = next
              @assign = tokens[i-2]
              
          operator = false


      
      
      return value



  window.Entities.slowparser = SlowParser
