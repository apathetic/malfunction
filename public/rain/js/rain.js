
// --------------------------
// rain
// --------------------------

var RAIN = (function(){

	var settings, views, things,
		drift,
		stats,
		camera, scene, renderer,
		mouseX = 0, mouseY = 0,
		particleSystem, particles,
		tracks = [], numTracks = 100;

	var VIEW_ANGLE = 75,
	    NEAR = 1,
	    FAR = 4000;

	settings = {
		numParticles: 2000, 	// cannot add / remove particles easily, so create them all at once. Set an upper bound
		scale: 1,
		rotate: true,
		color: 0xffffff,
		ydepth: 1,
		zdepth: 1,
		size: 5,
		direction: [0, -1, 0],	// falling downwards, (ie. on the y-axis)
		cameraX: ( (Math.random() > 0.5) ? -500 : -600 ),
		cameraY: ( (Math.random() > 0.5) ? 300 : 300 ),
		cameraZ: ( (Math.random() > 0.5) ? 200 : 600 )
	};

	things = new Array(
		// {	// lava
		// 	rotate: false,
		// 	color: 0xff0000,
		// 	ydepth: 0,
		// 	direction: [1,0,0]
		// },
		{	// cube
			scale: 0.3,		// Math.sqrt(500000.0) / 1000.0;
			rotate: true,
		},
		{	// waterfall
			numParticles: 1000,
			scale: 1,
			rotate: true,
			zdepth: 0.1,
			size: 12
		}
	);
	var which = Math.floor(Math.random() * 3);

	for ( var key in things[which] ) {
		settings[key] = things[which][key];
	}

	// drift = new Array ([0, -1, 0], [1, 0, 0]);
	drift = settings['direction'];


	// ------------------


	function animate() {

		requestAnimationFrame( animate );
		// stats.update();


		// var timer = Date.now() * 0.0001;

		// camera.position.x = Math.cos( timer ) * 200;
		// camera.position.z = Math.sin( timer ) * 200;
		// camera.lookAt( scene.position );
		// ..... camera.position.z =  mouseY * 0.1;


		// add some rotation to the system
		if (settings.rotate) { particleSystem.rotation.y += 0.005; }


		// iterate through every particle
		var pCount = settings.numParticles,
			scale = settings.scale,
			temp;

		while( pCount-- ) {

 			var particle = particles.vertices[pCount];

			// check if we need to reset (ie. is offscreen)			[TODO] optimize!
			if (settings.direction[0]) {	// only one direction on x axis is currently checked
				if ( particle.x > 500 ) {
					particle.x = -500;
					particle.velocity.x = 0;
				}
			} else if (settings.direction[1]) {
				if ( particle.y < 0 ) {
					particle.y = 1000 * scale;
					particle.velocity.y = 0;
				}
			} else {
				if ( particle.z < 0 ) {	}
			}


			// update the velocity
			temp = Math.random() * 0.1;
			particle.velocity.x += temp * drift[0];
			particle.velocity.y += temp * drift[1];
			particle.velocity.z += temp * drift[2];

			// and the position
			particle.add ( particle.velocity );
		}

		// Flag to the particle system that we've changed its vertices.
		// This is the dirty little secret.
		particleSystem.geometry.__dirtyVertices = true;

 		renderer.render( scene, camera );

	}

	//

	function calculateTracks() {
		// holds general "properties" for each track
		// ie. average particle length, speed
		for ( var i = 0; i < numTracks; i++ ) {
			tracks[i] = { baseLength: 1, baseSpeed: 1 };
		}

		// height of each track, -1 for the space in between them
	}


	function killParticle() {
		// drop alpha to zero

	}


	function makeParticles() {
		var material;

		particles = new THREE.Geometry();
		material = new THREE.ParticleBasicMaterial({
			color: settings.color,
			size: settings.size
		});

		for ( var p = 0; p < settings.numParticles; p++ ) {

			// create a particle with pseudorandom position
			var pX = (Math.random() * 1000 - 500) * settings.scale,
				pY = (Math.random() * 1000) * settings.scale * settings.ydepth,
				pZ = (Math.random() * 1000 - 500) * settings.scale * settings.zdepth,
				particle = new THREE.Vector3 (pX, pY, pZ);

			// create a velocity vector
			particle.velocity = new THREE.Vector3 ( settings.direction[0], settings.direction[1], settings.direction[2] );
			particle.velocity.multiplyScalar( Math.random() );

			// add it to the geometry
			particles.vertices.push(particle);

		}

		// create the particle system
		particleSystem = new THREE.ParticleSystem( particles, material );
		particleSystem.sortParticles = true;

		// scene.addChild(particleSystem);
		scene.add(particleSystem);

	}


	function onMouseMove(event) {
		// store the mouseX and mouseY position
		mouseX = event.clientX;
		mouseY = event.clientY;
	}


	function grid(hexcolor) {
		hexcolor = (hexcolor==null) ? 0xffffff : hexcolor;

		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -500, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 500, 0, 0 ) );

		for ( var i = 0; i <= 20; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: hexcolor, opacity: 0.2 } ) );
			line.position.z = ( i * 50 ) - 500;
			scene.add( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.2 } ) );
			line.position.x = ( i * 50 ) - 500;
			line.rotation.y = 90 * Math.PI / 180;
			scene.add( line );

		}
	}


	function init() {

		renderer = new THREE.WebGLRenderer();
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, window.innerWidth/window.innerHeight, NEAR, FAR);
		scene = new THREE.Scene();

		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.position.x = settings.cameraX;
		camera.position.y = settings.cameraY;
		camera.position.z = settings.cameraZ;
		camera.lookAt( scene.position );
		scene.add(camera);					// is otherwise added automatically

		// the renderer's canvas domElement is added to the body
		document.body.appendChild( renderer.domElement );


		grid(0xffffff);
		calculateTracks();
		makeParticles();



		// add the mouse move listener
		document.addEventListener( 'mousemove', onMouseMove, false );


		// stats = new Stats();
		// stats.domElement.style.position = 'absolute';
		// stats.domElement.style.top = '0px';
		// document.body.appendChild( stats.domElement );
	}


	return {
		ing: function(options) {
			if ( !window.requestAnimationFrame ) {
				window.requestAnimationFrame = ( function() {
					return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function( callback, element ) {
						window.setTimeout( callback, 1000 / 60 );
					};
				} )();
			}
 			if ( !Detector.webgl ) Detector.addGetWebGLMessage();

			init();
			animate();

		}
	}

});

var rain = new RAIN();
window.onload = rain.ing;







