$(window).ready(function() {
	E = window.Entities.classes;
	cx = (window.Map.width * 32) / 2;
	cy = (window.Map.height * 32) / 2;

	derp = new E.Derpifier();
	derp.place([26, 16]);

	derp = new E.Derpifier();
	derp.place([26, 19]);

	derp = new E.Derpifier();
	derp.place([30, 22], 2);

	water = new E.Water_Tank();
	water.place([25, 30], 2);

	water = new E.Water_Tank();
	water.place([29, 30], 2);

	water = new E.Water_Tank();
	water.place([33, 30], 2);

	window.Map.generate();
});
