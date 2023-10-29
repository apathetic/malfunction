/* jshint ignore:start */

var rayTest = function () {
	// if ( content.children.length ) {
		var vector = new THREE.Vector3( mouse.mx, mouse.my, 1 );
		projector.unprojectVector( vector, camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

		var intersectsBack = raycaster.intersectObjects( back.children, true );
		var intersects = raycaster.intersectObjects( content.children, true );

		if ( intersectsBack.length || intersects.length ) {
			if(!marker.visible) marker.visible=true;


			if ( intersectsBack.length ) {
				if(markerMaterial.color!==0x888888)markerMaterial.color.setHex(0x888888);
				point = intersectsBack[0].point;
				marker.position.copy( point );
				selected = intersectsBack[0].object;
			}
			if ( intersects.length) {

				//if (typeof intersects[0].object.name == 'string' || intersects[0].object.name instanceof String) if(intersects[0].object.name.substring(0,4) === "help") return;

				if(bullets.length)if(intersects[0].object.material.name === 'bullet') return;

				if(markerMaterial.color!==0xffffff) markerMaterial.color.setHex(0xFFFFFF);
				//if(!marker.visible)marker.visible=true;

				//console.log("intersects.length: "+ intersects.length);
				//console.log("intersects.distance: "+ intersects[0].distance);
				//console.log("intersects.face: "+ intersects[0].face);
				point = intersects[0].point;
				marker.position.copy( point );
				//if(intersects[0].face!==null)marker.lookAt(intersects[0].face.normal);
				selected = intersects[0].object;
				selectedCenter = point;

				//attachControl(selected);

				if(mouse.down){
					switch(mouseMode[mMode]){
						case 'delete': OimoWorker.postMessage({tell:"REMOVE", type:'object', n:selected.name}); break;
						case 'push': OimoWorker.postMessage({tell:"PUSH", n:selected.name, target:[point.x, point.y, point.z]}); break;

						case 'drag':
						    var p1 = [selected.position.x-point.x, selected.position.y-point.y, selected.position.z-point.z];
						break;




					}
			    }
		    }
		    if(mouseMode[mMode]==='shoot' && mouse.press){
		    	mouse.press = false;
				shoot(camera.position,point);
			}


	    } else {
	    	marker.visible = false;
	    }
	// }
}
