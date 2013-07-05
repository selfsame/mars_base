names = ['Jack','Rupert',
'Iona', 'Dalton', 'Rahne',
'Jennie',
'Casie',
'Numbers',
'Naomi',
'Milissa',
'Janina',
'Lauren',
'Herman',
'Tawnya',
'Bernadine',
'Marjory',
'Jennell',
'Ricardo',
'Rita',
'Coreen',
'Tennille',
'Shondra',
'Donny',
'Florine']


$(window).ready ->
  window.Map.generate()
  E = window.Entities.classes

  cx =(window.Map.width*32)/2
  cy = (window.Map.height*32)/2

  launchpad = new E.Launchpad('Launchpad', 'launchpad', [cx, cy])
  launchpad.sprite_size = 128
  launchpad.sprite_offset = [-64,-64]



  wrench = new E.Thing('wrench', 'wrench', [cx-(4*32), cy+(0*32)])
  solarpanel = new E.Thing('solarpanel', 'solarpanel', [cx-(2*32), cy-(8*32)])


  for i in [5..8]
    for j in [0..1]
      door = new E.Door('door', 'door', [cx+((i-2)*32), cy+((j-2)*32)])
      door.placed_image = 'door_h'

  for i in [5..8]
    for j in [5..5]
      door = new E.Airtank('airtanks', 'airtanks', [cx+((i-2)*32), cy+((j-2)*32)])

  for i in [-5..-1]
    for j in [3..4]
      door = new E.Locker('locker', 'locker', [cx+((i-2)*32), cy+((j-2)*32)])


  for i in [0..3]
    for j in [-3..-2]
      suit = new E.Thing('suit', 'engineer', [cx+((i-2)*32), cy+((j-2)*32)])
      suit.flags['suit'] = true

  for i in [0..4]
    x = parseInt(Math.random()*600+(window.Map.width*window.Map.tilesize / 2 )-300)
    y = parseInt(Math.random()*600+ (window.Map.width*window.Map.tilesize / 2)-300)
    name = names[parseInt(Math.random()*names.length)]
    advanced = new E.SlowColonist(name, 'barewalk', [x,y])
    advanced.speed = 1.5

    advanced.sprite_offset = [0, 0]
    advanced.sprite_size = 32
    advanced.run_script window.scripts.colonist

  for i in [0..0]
    slow = new E.SlowSentient('Norm', 'spirit', [500 + (Math.random()*700+350),500 + (Math.random()*700+350)])
    slow.speed = 2
    slow.footprint_img = 'tracks';
    slow.run_script  "
main: (   \n
  debug(@pos*0);\n
  go_near(@pos * 0 + 10x + 10y);\n
  debug(search('crater'));\n
  E2 = search('crater');\n
  S2 = E2;\n
  V2 = E2;\n
  go_near(V2);\n

  if I0 == null : (\n

    I0 = 0;\n
    V9 = @pos ;\n

    V5 = V9 + (-20x + random(50) );\n
    V5 = V5 + (-20y + random(50) );\n
    go_near( V5  );\n

  )\n
  if I0 > 4 : ( I9 = -1; )\n
  if F7 > 1 : (\n
    hang_out();\n
  )
  else I9 == -1 :(\n
    build_house();\n
  ) else :(\n
    gather_stuff();\n
  )\n
)\n

gather_stuff: (\n
  E0 = search(128); \n
  V0 = E0; \n
  S0 = E0; \n
  \n
  if E0:(\n
    if claim(E0) : (\n


      go_near( V0);\n
      wait(10);\n

      if pickup(S0) : (\n
        I0 = I0 + 1; wait(10);\n
      )\n
      
    )\n
  )\n
  else:(\n
    wander(10);\n
  )\n
  E0 = null; wait(10);\n
  V0 = null; wait(10);\n
  S0 = null; wait(10);\n
)\n

build_house: (\n
  if V7 == null: (\n
    V7 = V9 - 2x - 2y;\n
    I7 = 0;\n
  )\n
  if I7 > 14 : (V7 = V7 - 1x; F7 = 2;)\n
  else I7 > 12 : (V7 = V7 - 1y;)\n
  else I7 > 8 : (V7 = V7 - 1x;)\n
  else I7 > 4 : (V7 = V7 + 1y;)\n
  else : (V7 = V7 + 1x;)\n

  if goto( V7 ): () else : (\n
    I7 = I7 + 1;\n
  )\n
  E3 = pocket(0);\n
  S3 = pocket(0);\n
  debug(E3 == \"rock\");\n
  if pocket(0) == \"rock\" : (\n
    if drop(0):(\n
      I0 = I0 - 1;\n
      I7 = I7 + 1;\n
    ) \n
  ) else : (\n
    return_item();\n
  )\n
  if I0 <= 0 : (\n
    I9 = 1;\n
    go_near( V9 + 20x + 10y );\n

  )\n



)\n
hang_out : (\n
    go_near(V7);\n
    wait(30);\n
    wander(5);\n
  )\n



return_item : (\n
  go_near( V9 + 20x + 10y );\n
  if drop(0):(\n
      I0 = I0 - 1;\n

  ) \n
  )

"

    



window.scripts =
  colonist: "

main : (\n
  wait(random(50));\n
  survival();\n
  do_work();\n
  wander(8);\n
)\n



do_work: (\n
  get_task();
  if @job == 0 : (
    drop(0);\n
  ) else : (\n
    if @job == 'build' : ( task_build(); )\n
    if @job == 'place' : ( task_place(); )\n
  )\n
)\n

task_place:(\n

  E0 = pickup(go_near(search(@task)));\n
  get_task();\n

  if go_near(@task) : (\n
    drop(E0);\n
    place(E0);\n
  )\n

  
  get_task();\n
)\n


task_build:(\n
  goto(@task);\n
  build();\n
  get_task();\n
)\n


goto_object : (\n
  goto(claim(search(ARG)));\n
)\n

find_and_use : (\n
  use(pickup(goto(claim(search(ARG)))));\n
)\n

survival: (\n

  if @suit : (\n
    if @oxygen < (@max_oxygen / 3) : (\n
      goto_object('airtanks') ;\n
      use('airtanks');
    )\n

  ) else : (\n
    find_and_use('suit') ;\n

  )\n
)\n

  "


  test_suit: "
main:(\n
  slow_five(100);\n
  I0 = 11;
  I2 = double(double(slow_five(100)));\n
  wait(10000);\n

)\n

double:(\n
  RETURN ARG * 2;\n
)\n

pause: ( wait(40);RETURN 5;)\n


"

  testtwo: "
main:(\n
  I0 = get_seven('dog');\n
  I2 = test_two(10 + get_seven('cat'));\n

)\n

get_seven:(\n
  wait(40);\n
  debug(ARG);\n
  RETURN 7;\n
)\n

test_two:(\n
  I4 = ARG;
  wait(40)\n
  RETURN null + 7;\n
)\n

"