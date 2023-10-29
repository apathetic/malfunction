function createRequestObject() {
    var ro;
    var browser = navigator.appName;
    if (browser == "Microsoft Internet Explorer") {
        ro = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else {
        ro = new XMLHttpRequest();
    }
    return ro;
}

var http = createRequestObject();

function sndReq(action, arg) {
    http.open('get', 'irreg.php?action='+action);
    http.onreadystatechange = handleResponse(arg);
    http.send(null);
}

function handleResponse(arg) {
    if (http.readyState == 4) {
        var response = http.responseText;

//        var update = new Array();
//        if(response.indexOf('|' != -1)) {
//            update = response.split('|');
//            document.getElementById(update[0]).innerHTML = update[1];

		if (document.getElementById) {
            document.getElementById(arg).innerHTML = response;
        }
    }
}







/*

Expanding this approach a bit to send multiple parameters in the
request, for example, would be really simple.  Something like:

  function sndReqArg(action, arg) {
    http.open('get', 'rpc.php?action='+action+'&arg='+arg);
    http.onreadystatechange = handleResponse;
    http.send(null);
  }




....with some other exception catching: 

function handleResponse() {
    if (http.readyState == 4) {
//		try	{
//			if (formRequester.status == 200) {

				var response = http.responseText;
				var update = new Array();
				if (response.indexOf('|' != -1)) {
					update = response.split('|');
//					document.getElementById(update[0]).innerHTML = update[1];
					document.getElementById('future').innerHTML = response;

//test(update[0],update[1]);
				}

//				else if (requester.status != 0) {	// IE returns a status code of 0 on some occasions, so ignore this case
//					alert("There was an error while retrieving the URL: " + formRequester.statusText);
//				}
//			}
//			catch (error)
//		}
    }
}
  
  */