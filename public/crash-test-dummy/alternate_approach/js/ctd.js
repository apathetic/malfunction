var CTD = (function(){
	'use strict';

	Physijs.scripts.worker = '../physijs_worker.js';
	Physijs.scripts.ammo = 'examples/js/ammo.js';

	var init, render, createDummy,
		renderer, render_stats, physics_stats, scene, light, ground, ground_material, camera;

	init = function() {
		TWEEN.start();

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		document.body.appendChild( renderer.domElement );

		// render_stats = new Stats();
		// render_stats.domElement.style.position = 'absolute';
		// render_stats.domElement.style.top = '0px';
		// render_stats.domElement.style.zIndex = 100;
		// document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

		// physics_stats = new Stats();
		// physics_stats.domElement.style.position = 'absolute';
		// physics_stats.domElement.style.top = '50px';
		// physics_stats.domElement.style.zIndex = 100;
		// document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

		scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		scene.addEventListener(
			'update',
			function() {
				scene.simulate( undefined, 2 );
				// physics_stats.update();
			}
		);

		camera = new THREE.PerspectiveCamera(
			35,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		camera.position.set( 60, 50, 60 );
		camera.lookAt( scene.position );
		scene.add( camera );

		// Light
		light = new THREE.DirectionalLight( 0xFFFFFF );
		light.position.set( 20, 40, -15 );
		light.target.position.copy( scene.position );
		light.castShadow = true;
		light.shadowCameraLeft = -60;
		light.shadowCameraTop = -60;
		light.shadowCameraRight = 60;
		light.shadowCameraBottom = 60;
		light.shadowCameraNear = 20;
		light.shadowCameraFar = 200;
		light.shadowBias = -.0001
		light.shadowMapWidth = light.shadowMapHeight = 2048;
		light.shadowDarkness = .7;
		scene.add( light );


		requestAnimationFrame( render );
		scene.simulate();

		createDummy();
	};

	render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		// render_stats.update();
	};


	createDummy = function() {

	}

	return {
		init: init
	}

}());