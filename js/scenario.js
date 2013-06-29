// Generated by CoffeeScript 1.3.1
(function() {
  var names;

  names = ['Jack', 'Rupert', 'Iona', 'Jennie', 'Casie', 'Numbers', 'Naomi', 'Milissa', 'Janina', 'Lauren', 'Herman', 'Tawnya', 'Bernadine', 'Marjory', 'Jennell', 'Ricardo', 'Rita', 'Coreen', 'Tennille', 'Shondra', 'Donny', 'Florine'];

  $(window).ready(function() {
    var E, advanced, cx, cy, door, i, j, launchpad, name, slow, solarpanel, suit, wrench, x, y, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    E = window.Entities.classes;
    cx = (window.Map.width * 32) / 2;
    cy = (window.Map.height * 32) / 2;
    launchpad = new E.Launchpad('Launchpad', 'launchpad', [cx, cy]);
    launchpad.sprite_size = 128;
    launchpad.sprite_offset = [-64, -64];
    wrench = new E.Thing('wrench', 'wrench', [cx - (4 * 32), cy + (0 * 32)]);
    solarpanel = new E.Thing('solarpanel', 'solarpanel', [cx - (2 * 32), cy - (8 * 32)]);
    for (i = _i = 5; _i <= 8; i = ++_i) {
      for (j = _j = 0; _j <= 1; j = ++_j) {
        door = new E.Door('door', 'door', [cx + ((i - 2) * 32), cy + ((j - 2) * 32)]);
        door.placed_image = 'door_h';
      }
    }
    for (i = _k = 5; _k <= 8; i = ++_k) {
      for (j = _l = 5; _l <= 5; j = ++_l) {
        door = new E.Airtank('airtanks', 'airtanks', [cx + ((i - 2) * 32), cy + ((j - 2) * 32)]);
      }
    }
    for (i = _m = -5; _m <= -1; i = ++_m) {
      for (j = _n = 3; _n <= 4; j = ++_n) {
        door = new E.Locker('locker', 'locker', [cx + ((i - 2) * 32), cy + ((j - 2) * 32)]);
      }
    }
    for (i = _o = 0; _o <= 3; i = ++_o) {
      for (j = _p = -3; _p <= -2; j = ++_p) {
        suit = new E.Thing('suit', 'engineer', [cx + ((i - 2) * 32), cy + ((j - 2) * 32)]);
      }
    }
    for (i = _q = 0; _q <= 7; i = ++_q) {
      x = parseInt(Math.random() * 600 + (window.Map.width * window.Map.tilesize / 2) - 300);
      y = parseInt(Math.random() * 600 + (window.Map.width * window.Map.tilesize / 2) - 300);
      name = names[parseInt(Math.random() * names.length)];
      advanced = new E.Engineer(name, 'barewalk', [x, y]);
      advanced.speed = 1.5;
      advanced.sprite_offset = [0, 0];
      advanced.sprite_size = 32;
    }
    slow = new E.Scripted('Norm', 'spirit', [300, 300]);
    return slow.run_script("main ( \n  $i9 = 1;\n  wait(40);\n  if 1:(\n    $i5 = 1;\n    wait(40);\n    $i6 = 21;\n    wait(40);\n    $i7 = 41;\n    $f4 = 1.2;\n    if 1:(\n      wait(40);\n    )\n      )\n  $i3 = 66;\n  wander(4);\n  )");
  });

  /*
  if $i1 == 10:(\n
      $i3 = 6;\n
    )\n
    wait($i1*5); wait( $i1*2+(3*10));\n
    \n
    wander(5);\n
    $f5 = 89 * (2 / 3);\n
    $i1 /= $f5 * .5;\n
    wait(50);\n
  */


}).call(this);
