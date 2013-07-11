$(window).ready(function() {
	E = window.Entities.classes;
	cx = (window.Map.width) / 2;
	cy = (window.Map.height) / 2;

	window.Objects.add_buildable('Water Tank', 'Water_Tank');
	window.Objects.add_buildable('Derpifier', 'Derpifier');
	window.Objects.add_buildable('Air Vent', 'Air_Vent');
	window.Objects.add_buildable('Wide Door', 'Wide_Door');
	window.Objects.add_buildable('Airlock', 'Airlock');
	
	var Launch = new E.Launchpad2();
	Launch.place([cx, cy]);
	
	var derp = new E.Derpifier();
	derp.place([26, 16]);

	derp = new E.Derpifier();
	derp.place([26, 19]);

	derp = new E.Derpifier();
	derp.place([31, 17], 2);

	var water = new E.Water_Tank();
	water.place([25, 30], 2);

	water = new E.Water_Tank();
	water.place([29, 30], 2);

	water = new E.Water_Tank();
	water.place([33, 30], 2);
	water.remove();
	water.place([33, 30], 3);
	
	//window.Map.generate();
});
