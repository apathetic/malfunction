var CTD = window.CTD || {};

CTD.controls = (function() {

	var button = document.getElementById('toggle');
	var controls = document.getElementById('controls');

	button.addEventListener('click', toggle, false);

	function toggle() {
		controls.classList.toggle('active');
	}

})();