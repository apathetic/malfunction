var CTD = window.CTD || {};

CTD.image = (function() {

	var dropZone = document.getElementById('drop-zone');
	var fileupload = document.getElementById('file-chooser');
	var fileInput = document.getElementById('source-file');
	var face = document.getElementById('face');

	function onSubmit(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();

		if (fileInput.files.length) {
			save(fileInput.files[0]);
		}
	}

	function cancel(evt) {
		evt.preventDefault();
	}

	function dropFile(evt) {

		evt.stopPropagation();
		evt.preventDefault();

		var files = evt.dataTransfer.files || evt.target.files; // File list

		// no gifs at this time
		if (files.length && (['image/jpg','image/png'].indexOf(files[0].type) > -1) ) {
			save(files[0]);
		} else {
			console.log('incorrect type of file');
		}
	}

	function save(image) {
		dropZone.classList.add('dropped');

		image = new Image();

		imageData = getBase64Image(image);
		if (imageData) {
			localStorage.setItem('face', imageData);
			preview(imageData);
		} else {
			console.log('could not save');
		}
	}

	function preview(image) {
		face.src = 'data:image/png;base64,' + image;
	}

	function getBase64Image(img) {
		var canvas = document.createElement('canvas');
		var dataURL;
		var ctx;

		canvas.width = img.width;
		canvas.height = img.height;

		// Copy the image contents to the canvas
		ctx = canvas.getContext('2d');


		ctx.drawImage(img, 0, 0);


        try {
			dataURL = canvas.toDataURL('image/png');
			return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
		} catch(e) {
			return false;
		}

	}

	function init() {
		dropZone.addEventListener('drop', dropFile, false);
		dropZone.addEventListener('dragover', cancel, false);
		dropZone.addEventListener('dragenter', cancel, false);
		dropZone.addEventListener('dragexit', cancel, false);
		fileupload.addEventListener('submit', onSubmit, false);

		var face = localStorage.getItem('face');

		if (face) {
			preview(face);
		}

	}

	return {
		init: init
	}

})();