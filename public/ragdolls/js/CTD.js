'use strict';

// GLOBAL:
var CTD = window.CTD || {};

// three var
var camera, scene, light, renderer, container;
var back;
var ToRad = Math.PI / 180;
var camPos = { h: 90, v: 60, distance: 400, automove: false  };


// oimo vars
var world = null;




// CTD.vars = {
// 	camera: undefined,
// 	scene: undefined,
// 	meshes: [],
// 	...
// }

// CTD.fn = {
// 	gradTexture: function() {}
// 	basicTexture: function() {}
// }


//----------------------------------
//  (global) TEXTURE FNs
//----------------------------------

function gradTexture(color) {
	var c = document.createElement("canvas");
	var ct = c.getContext("2d");
	c.width = 16; c.height = 256;
	var gradient = ct.createLinearGradient(0,0,0,256);
	var i = color[0].length;
	while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
	ct.fillStyle = gradient;
	ct.fillRect(0,0,16,256);
	var texture = new THREE.Texture(c);
	texture.needsUpdate = true;
	return texture;
}

function basicTexture(n, p){
	var canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 64;
	var ctx = canvas.getContext( '2d' );
	var colors = [];
	var grd;
	if(n===0){ // sphere
		colors[0] = "#C8CAC0";
		colors[1] = "#989A90";
	}
	if(n===1){ // sphere sleep
		colors[0] = "#989A90";
		colors[1] = "#585858";
	}
	if(n===2){ // box
		colors[0] = "#AA8058";
		colors[1] = "#FFAA58";
	}
	if(n===3){ // box sleep
		colors[0] = "#383838";
		colors[1] = "#585858";
	}


	if (p) { grd = ctx.createLinearGradient(0,0,64,0); }
	else { grd = ctx.createLinearGradient(0,0,0,64); }
	grd.addColorStop(0,colors[1]);
	grd.addColorStop(1,colors[0]);

   ctx.fillStyle = grd;
   ctx.fillRect(0, 0, 64, 64);

   var tx = new THREE.Texture(canvas);
   tx.needsUpdate = true;
   return tx;
}


//----------------------------------
//  SCENE
//----------------------------------
CTD.scene = (function(){

	var center = {x:0, y:0, z:0};

	function init() {
		// infos = document.getElementById("info");

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		center.y = 50;
		initCamera(90,75,400);

		scene = new THREE.Scene();

		scene.add( new THREE.AmbientLight( 0x3D4143 ) );

		light = new THREE.DirectionalLight( 0xffffff , 1);
		light.position.set( 300, 1000, 500 );
		light.target.position.set( 0, 0, 0 );
		light.castShadow = true;
		light.shadowCameraNear = 500;
		light.shadowCameraFar = 1600;
		light.shadowCameraFov = 70;
		light.shadowBias = 0.0001;
		light.shadowDarkness = 0.7;
		//light.shadowCameraVisible = true;
		light.shadowMapWidth = light.shadowMapHeight = 1024;
		scene.add( light );

		// background
		var buffgeoBack = new THREE.BufferGeometry();
		buffgeoBack.fromGeometry( new THREE.IcosahedronGeometry(8000,1) );

		back = new THREE.Mesh( buffgeoBack, new THREE.MeshBasicMaterial( { map:gradTexture([[1,0.75,0.5,0.25], ['#1B1D1E','#3D4143','#72797D', '#b0babf']]), side:THREE.BackSide, depthWrite: false }  ));
		back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15*ToRad));
		scene.add( back );

		renderer = new THREE.WebGLRenderer({precision: "mediump", antialias:true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFShadowMap;
		//renderer.gammaInput = true;
		//renderer.gammaOutput = true;

		container = document.getElementById("container");
		container.appendChild( renderer.domElement );

		CTD.ui.init();
		loop();
	}

	function initCamera(h,v,d) {
		camPos.h = h || 90;
		camPos.v = v || 60;
		camPos.distance = d || 400;
		moveCamera();
	}

	function moveCamera() {
		camera.position.copy( Orbit(center, camPos.h, camPos.v, camPos.distance) );
		camera.lookAt(center);
	}

	function Orbit(origine, h, v, distance) {
		origine = origine || new THREE.Vector3();
		var p = new THREE.Vector3();
		var phi = v*Math.PI / 180;
		var theta = h*Math.PI / 180;
		p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
		p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
		p.y = (distance * Math.cos(phi)) + origine.y;
		return p;
	}

	function loop() {
		requestAnimationFrame( loop );
		renderer.clear();
		renderer.render( scene, camera );
		//displayInfo();
	}

	return {
		init: init,
		moveCamera: moveCamera
	};

})();


//----------------------------------
//  CONTROLS
//----------------------------------
CTD.ui = (function(){

	var mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, down:false, over:false, moving:true, button:0 };
	var viewport = { w:window.innerWidth, h:window.innerHeight };
	var intersects;
	var raycaster, projector;
	var px, py;
	var offset = new THREE.Vector3(),
		// controls = {},
		INTERSECTION, SELECTED;


	function init(){
		raycaster = new THREE.Raycaster();
		projector = new THREE.Projector();

	    container.addEventListener( 'mousemove', onMouseMove, false );
	    container.addEventListener( 'mousedown', onMouseDown, false );
	    container.addEventListener( 'mouseout',  onMouseUp, false );
	    container.addEventListener( 'mouseup',   onMouseUp, false );

	    container.addEventListener( 'touchstart', onMouseDown, false );
	    container.addEventListener( 'touchend',   onMouseUp, false );
	    container.addEventListener( 'touchmove',  onMouseMove, false );

	    container.addEventListener( 'mousewheel',     onMouseWheel, false );
	    container.addEventListener( 'DOMMouseScroll', onMouseWheel, false );

	    window.addEventListener( 'resize', onWindowResize, false );
	}

	function mouseRay(e) {
		e.preventDefault();

		if (e.touches){
			px = e.clientX || e.touches[ 0 ].pageX;
			py = e.clientY || e.touches[ 0 ].pageY;
		} else {
			px = e.clientX;
			py = e.clientY;
			mouse.button = e.which;				// 0: default  1: left  2: middle  3: right
		}

	    mouse.mx = ( px / viewport.w ) * 2 - 1;
	    mouse.my = - ( py / viewport.h ) * 2 + 1;

		var vector = new THREE.Vector3( mouse.mx, mouse.my, 0.5 );

		projector.unprojectVector( vector, camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
		intersects = raycaster.intersectObjects( CTD.ragdoll.meshs() );
	}

	function onMouseMove(e){

		mouseRay(e);

		container.style.cursor = intersects.length ? 'pointer' : mouse.down ? 'move' : 'auto';

		if (SELECTED) {
			INTERSECTION = raycaster.intersectObject( back );
			SELECTED.position.copy( INTERSECTION[ 0 ].point.sub( offset ) );



			// mesh.position.copy(body.getPosition());
			// mesh.quaternion.copy(body.getQuaternion());




			return;
		}

		if (mouse.down) {
			camPos.h = ((px - mouse.ox) * 0.3) + mouse.h;
			camPos.v = (-(py - mouse.oy) * 0.3) + mouse.v;
			CTD.scene.moveCamera();
			return;
		}
	}

	function onMouseDown(e){

		mouseRay(e);

		mouse.ox = px;
		mouse.oy = py;
		mouse.h = camPos.h;
		mouse.v = camPos.v;
		mouse.down = true;

		if ( intersects.length ) {											// if we clicked on "something"
			SELECTED = intersects[ 0 ].object;								// copy what we clicked on (ie. the closed to the camera or index 0) into SELECTED
			INTERSECTION = raycaster.intersectObject( back );				// find out where the .... mouseRay... intersects? .... with the background plane ...?
			offset.copy( INTERSECTION[ 0 ].point ).sub( back.position );

			// var point = intersects[0].point;
			// var p1 = [SELECTED.position.x - point.x, SELECTED.position.y - point.y, SELECTED.position.z-point.z];
		}
	}

	function onMouseUp(e){
	    mouse.down = false;

		// controls.enabled = true;

		if ( SELECTED ) {
			console.log('NO NO NO NO');
			back.position.copy( SELECTED.position );		// "back" is: new THREE.Mesh.....
			SELECTED = null;
		}

	    document.body.style.cursor = 'auto';
	}

	function onMouseWheel(e) {
	    var delta = 0;

	    if (e.wheelDeltaY) { delta = e.wheelDeltaY * 0.01; }
	    else if (e.wheelDelta) {delta = e.wheelDelta * 0.05; }
	    else if (e.detail) { delta =- e.detail * 1.0; }

	    camPos.distance -= (delta * 10);
	    CTD.scene.moveCamera();
	}

	function onWindowResize() {
	    viewport.w = window.innerWidth;
	    viewport.h = window.innerHeight;
	    camera.aspect = viewport.w / viewport.h;
	    camera.updateProjectionMatrix();
	    renderer.setSize( viewport.w, viewport.h );
	}



	return {
		init: init
	};

})();


//----------------------------------
//  RAG DOLL
//----------------------------------
CTD.ragdoll = (function(){

	var collision = false;
	var bgColor = 0x252627;
	var max = 3;	// number of rag dolls
	var bodys;
	var joints;
	var meshs = [];
	var grounds = [];
	var geoBox, geoSphere, geoSphere2, geoCylinder, geoCylinder2;
	var matBox, matBox2, matBox3, matSphere, matBoxSleep, matSphereSleep, matGround,  matBoxSleep2, matHead;

	function init() {

		// geometry
		geoCylinder = new THREE.BufferGeometry();
		geoCylinder2 = new THREE.BufferGeometry();
		geoSphere = new THREE.BufferGeometry();
		geoSphere2 = new THREE.BufferGeometry();
		geoBox = new THREE.BufferGeometry();

		geoCylinder.fromGeometry( new THREE.CylinderGeometry( 0.5, 0.5, 1, 16 ) );
		geoCylinder2.fromGeometry( new THREE.CylinderGeometry( 0.5, 0.5, 1, 16 ) );
		geoSphere.fromGeometry( new THREE.SphereGeometry( 1 , 20, 10 ) );
		geoSphere2.fromGeometry(new THREE.SphereGeometry( 0.5 , 10, 6 ) );
		geoBox.fromGeometry( new THREE.BoxGeometry( 1, 1, 1 ) );

		geoCylinder2.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 2 ) );

		// material
		matSphere = new THREE.MeshPhongMaterial( { map: basicTexture(0), name:'sph',transparent:true, opacity:0.6, shininess:120, specular:0xffffff} );
		matHead = new THREE.MeshLambertMaterial( { color: 0xe8b36d, name:'sphHH', shininess:60, specular:0xffffff  } );
		matBox = new THREE.MeshPhongMaterial( {  map: basicTexture(2), name:'box', shininess:100, specular:0xffffff  } );
		matBox2  = new THREE.MeshPhongMaterial( {  map: basicTexture(2,1), name:'box2', shininess:100, specular:0xffffff  } );
		matBox3  = new THREE.MeshPhongMaterial( {  map: basicTexture(2,0), name:'box3', shininess:100, specular:0xffffff  } );
		matGround = new THREE.MeshLambertMaterial( { color: 0x3D4143 } );

		populate();
		CTD.physics.calculate.push(update);
	}

	function populate() {

		// reset old
		clearMesh();
		world.clear();
		bodys = [];
		joints = [];

		var ground;

		ground = new OIMO.Body({size:[300, 40, 300], pos:[0,-20,0], world:world});
		addStaticBox([300, 40, 300], [0,-20,0], [0,0,0]);

		var i = max;
		var j = 0;
		var k = 0;
		var l = 0;
		var m = 0;
		var px,py,pz;
		var spring = [2, 0.3];


		while (i--){
			l++;

			px = 0;
			py = 200 + (i*150);
			pz = 0;

			// ---------------------------------------- pelvis ----------------------------------------

			bodys[j+0] = new OIMO.Body({type: 'box', size: [20,10,15], pos: [px,py-20,pz], move: true, noSleep: true, world: world, name: 'pelvis'+j });
			meshs[j+0] = addThreeMesh([20,10,15], null, null, 0, 'cylinder');

			bodys[j+1] = new OIMO.Body({type:"box", size:[20,10,15], pos:[px,py-10,pz], move:true, noSleep: true, world:world, name:'spine1_'+j });
			meshs[j+1] = addThreeMesh([20,10,15], null, null, 0, 'cylinder');

			bodys[j+2] = new OIMO.Body({type:"box", size:[20,10,15], pos:[px,py,pz], move:true, noSleep: true, world:world, name:'spine2_'+j });
			meshs[j+2] = addThreeMesh([20,10,15], null, null, 0, 'cylinder');

			bodys[j+3] = new OIMO.Body({type:"box", size:[20,10,15], pos:[px,py+10,pz], move:true, noSleep: true, world:world, name:'spine3_'+j });
			meshs[j+3] = addThreeMesh([20,10,15], null, null, 0, 'cylinder');

			joints[k+0] = new OIMO.Link({body1:'pelvis'+j, body2:'spine1_'+j, pos1:[0,5,0], pos2:[0,-5,0], min:2, max:20, collision:collision, world:world, spring:spring });
			joints[k+1] = new OIMO.Link({body1:'spine1_'+j, body2:'spine2_'+j, pos1:[0,5,0], pos2:[0,-5,0], min:2, max:20, collision:collision, world:world, spring:spring});
			joints[k+2] = new OIMO.Link({body1:'spine2_'+j, body2:'spine3_'+j, pos1:[0,5,0], pos2:[0,-5,0], min:2, max:20, collision:collision, world:world, spring:spring});

			// ---------------------------------------- head ----------------------------------------

			bodys[j+4] = new OIMO.Body({type:"sphere", size:[10,10,10], pos:[px,py+30,pz], move:true, noSleep: true, world:world, name:'head'+j });
			meshs[j+4] = addThreeMesh([10,10,10], null, null, 1, 'sphere');

			joints[k+3] = new OIMO.Link({body1:'spine3_'+j, body2:'head'+j,   pos1:[0,5,0], pos2:[0,-10,0], min:2, max:20, collision:collision, world:world, spring:spring});

			// ---------------------------------------- arms ----------------------------------------

			bodys[j+5] = new OIMO.Body({type:"box", size:[20,10,10], pos:[px-20,py+8,pz], rot:[0,0,20], move:true, world:world, name:'L_arm'+j });
			meshs[j+5] = addThreeMesh([20,10,10], null, null, 3, 'cylinder2');
			bodys[j+6] = new OIMO.Body({type:"box", size:[20,8,8], pos:[px-40,py,pz], rot:[0,0,20], move:true, world:world, name:'LF_arm'+j });
			meshs[j+6] = addThreeMesh([20,8,8], null, null, 3, 'cylinder2');

			bodys[j+7] = new OIMO.Body({type:"box", size:[20,10,10], pos:[px+20,py+8,pz], rot:[0,0,-20], move:true, world:world, name:'R_arm'+j });
			meshs[j+7] = addThreeMesh([20,10,10], null, null, 3, 'cylinder2');
			bodys[j+8] = new OIMO.Body({type:"box", size:[20,8,8], pos:[px+40,py,pz], rot:[0,0,-20], move:true, world:world, name:'RF_arm'+j });
			meshs[j+8] = addThreeMesh([20,8,8], null, null, 3, 'cylinder2');

			joints[k+4] = new OIMO.Link({body1:'spine3_'+j, body2:'L_arm'+j, pos1:[-10,0,0], pos2:[10,0,0], axe1:[0,1,1], axe2:[0,1,1], collision:collision, world:world});
			joints[k+5] = new OIMO.Link({body1:'spine3_'+j, body2:'R_arm'+j, pos1:[10,0,0], pos2:[-10,0,0], axe1:[0,1,1], axe2:[0,1,1], collision:collision, world:world});

			joints[k+6] = new OIMO.Link({body1:'L_arm'+j, body2:'LF_arm'+j, pos1:[-10,0,0], pos2:[10,0,0], axe1:[0,1,0], axe2:[0,1,0], collision:collision, world:world});
			joints[k+7] = new OIMO.Link({body1:'R_arm'+j, body2:'RF_arm'+j, pos1:[10,0,0], pos2:[-10,0,0], axe1:[0,1,0], axe2:[0,1,0], collision:collision, world:world});

			// ---------------------------------------- legs ----------------------------------------

			bodys[j+9] = new OIMO.Body({type:"box", size:[10,20,10], pos:[px-6,py-40,pz], rot:[0,0,-20], move:true, world:world, name:'L_leg'+j });
			meshs[j+9] = addThreeMesh([10,20,10], null, null, 0, 'cylinder');
			bodys[j+10] = new OIMO.Body({type:"box", size:[8,20,8], pos:[px-15,py-70,pz], rot:[0,0,-20], move:true, world:world, name:'LF_leg'+j });
			meshs[j+10] = addThreeMesh([8,20,8], null, null, 0, 'cylinder');

			bodys[j+11] = new OIMO.Body({type:"box", size:[10,20,10], pos:[px+6,py-40,pz], rot:[0,0,20], move:true, world:world, name:'R_leg'+j });
			meshs[j+11] = addThreeMesh([10,20,10], null, null, 0, 'cylinder');
			bodys[j+12] = new OIMO.Body({type:"box", size:[8,20,8], pos:[px+15,py-70,pz], rot:[0,0,20], move:true, world:world, name:'RF_leg'+j });
			meshs[j+12] = addThreeMesh([8,20,8], null, null, 0, 'cylinder');

			joints[k+8] = new OIMO.Link({body1:'pelvis'+j, body2:'L_leg'+j, pos1:[-6,-5,0], pos2:[0,10,0], min:2, max:60, collision:collision, world:world});
			joints[k+9] = new OIMO.Link({body1:'pelvis'+j, body2:'R_leg'+j, pos1:[6,-5,0], pos2:[0,10,0], min:2, max:60, collision:collision, world:world});

			joints[k+10] = new OIMO.Link({body1:'L_leg'+j, body2:'LF_leg'+j, pos1:[0,-10,0], pos2:[0,10,0], axe1:[1,0,0], axe2:[1,0,0], min:2, max:60, collision:collision, world:world});
			joints[k+11] = new OIMO.Link({body1:'R_leg'+j, body2:'RF_leg'+j, pos1:[0,-10,0], pos2:[0,10,0], axe1:[1,0,0], axe2:[1,0,0], min:2, max:60, collision:collision, world:world});


			j+=13;
			k+=12;
		}
	}

	function update() {
		var x, y, z;
		var i = bodys.length;
		var mesh;
		var body;

		// ***** HERE we need a way to take into account mouse dragging, etc. updated positions of body parts ****

		while (i--){
			body = bodys[i].body;
			mesh = meshs[i];

			mesh.position.copy(body.getPosition());
			mesh.quaternion.copy(body.getQuaternion());

			// reset position
			/* * /
			if (mesh.position.y < -200 && bodys[i].name.substring(0,6)==='pelvis'){		// if object has fallen off the bottom of the scene ( < -200 )
																						// we also start from "pelvis", as all body parts are relative to that in the array
				x = -100 + Math.random()*200;
				z = -100 + Math.random()*200;
				y = 500 + Math.random()*200;
				// chest
				bodys[i+0].body.resetPosition(x,y-20,z);
				bodys[i+1].body.resetPosition(x,y-10,z);
				bodys[i+2].body.resetPosition(x,y,z);
				bodys[i+3].body.resetPosition(x,y+10,z);
				bodys[i+4].body.resetPosition(x,y+30,z);
				// arm
				bodys[i+5].body.resetPosition(x-20,y+8,z);
				bodys[i+6].body.resetPosition(x-40,y,z);
				bodys[i+7].body.resetPosition(x+20,y+8,z);
				bodys[i+8].body.resetPosition(x+40,y,z);
				// leg
				bodys[i+9].body.resetPosition(x-6,y-40,z);
				bodys[i+10].body.resetPosition(x-15,y-70,z);
				bodys[i+11].body.resetPosition(x+6,y-40,z);
				bodys[i+12].body.resetPosition(x+15,y-70,z);

				bodys[i+0].body.resetRotation(0,0,0);
				bodys[i+1].body.resetRotation(0,0,0);
				bodys[i+2].body.resetRotation(0,0,0);
				bodys[i+3].body.resetRotation(0,0,0);
				bodys[i+4].body.resetRotation(0,0,0);

				bodys[i+5].body.resetRotation(0,0,20);
				bodys[i+6].body.resetRotation(0,0,20);
				bodys[i+7].body.resetRotation(0,0,-20);
				bodys[i+8].body.resetRotation(0,0,-20);

				bodys[i+9].body.resetRotation(0,0,-20);
				bodys[i+10].body.resetRotation(0,0,-20);
				bodys[i+11].body.resetRotation(0,0,20);
				bodys[i+12].body.resetRotation(0,0,20);
			}
			/* */
		}
	}

	function addStaticBox(size, position, rotation) {
		var mesh = new THREE.Mesh( new THREE.BoxGeometry( size[0], size[1], size[2] ), matGround );
		mesh.position.set( position[0], position[1], position[2] );
		mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
		scene.add( mesh );
		grounds.push(mesh);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
	}

	function addThreeMesh(size, position, rotation, color, type) {
		var mesh, mat, m2;

		if(color===1){ mat = matSphere; }
		else if(color===2){mat = matBox2;}
		else if(color===3){mat = matBox3;}
		else{ mat = matBox;}

		if(type==='sphere'){
			mesh = new THREE.Mesh( geoSphere, mat );
			m2 = new THREE.Mesh( geoSphere2, matHead );
			m2.scale.set(1,1.4,1);
			m2.position.set(0,-0.3,0);
			mesh.add(m2);
		}
		else if(type==='cylinder'){mesh = new THREE.Mesh( geoCylinder, mat );}
		else if(type==='cylinder2'){mesh = new THREE.Mesh( geoCylinder2, mat );}
		else { mesh = new THREE.Mesh( geoBox, mat ); }
		mesh.scale.set( size[0], size[1], size[2] );

		if (position) { mesh.position.set( position[0], position[1], position[2] ); }
		if (rotation) { mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad ); }
		scene.add( mesh );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		return mesh;
	}

	function updateHeadMaterial(which, material ) {
		// matHead = new THREE.MeshLambertMaterial( { color: 0xe8b36d, name:'sphHH', shininess:60, specular:0xffffff  } );


		// texture = THREE.ImageUtils.loadTexture('crate.gif', {}, function() {
		// 	renderer.render(scene);
		// }),

		var head = ((which-1) * 13) + 4;		// we can do 1 2 or 3

		meshs[head].material.map = THREE.ImageUtils.loadTexture(material);
		meshs[head].material.needsUpdate = true;
	}

	function clearMesh(){
		var i=meshs.length;
		while (i--) { scene.remove(meshs[ i ]); }
		i = grounds.length;
		while (i--) { scene.remove(grounds[ i ]); }
		grounds = [];
		meshs = [];
	}

	return {
		init: init,
		// meshs: meshs,				// for raycasting checks
		meshs: function() { return meshs; },				// for raycasting checks
		updateHead: updateHeadMaterial
	};

})();



//----------------------------------
//  OIMO PHYSICS
//----------------------------------
CTD.physics = (function(){

	var calculate = [], i;

	function init(){
		world = new OIMO.World();
		gravity(-0.5);	// gravity (20 <--> -20). Earth standard: -9.81
		setInterval(updateOimoPhysics, 1000/60);
	}

	function updateOimoPhysics() {
		world.step();
		i = calculate.length;
		while (i--) {
			calculate[i].call();
		}
	}

	function gravity(nG){
		world.gravity = new OIMO.Vec3(0, nG, 0);
	}

	return {
		init: init,
		calculate: calculate,	// Array.prototype.push.call(
		gravity: gravity
	};

})();

