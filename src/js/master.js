if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength, padString) {
		targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
		padString = String(padString || ' ');
		if (this.length > targetLength) return String(this)
		else {
			targetLength = targetLength-this.length;
			if (targetLength > padString.length) {
				padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
			}
			return padString.slice(0, targetLength) + String(this);
		}
	}
}

// Bootleg, later this'll be fetched from server
const config = {
	fileUpload: {
		maxFiles: 3,
		allowedTypes: ["image/jpeg", "image/png", "image/gif", "video/webm", "image/webp"]
	}
}

// document.createElement wrapper to add attributes immidiately
function createElement (tagName, attr = {}){
	let element = document.createElement(tagName);
	for (let i = 0; i < attr.length; i++) element[i] = attr[i];
	return element
}

// Ajax page loading
function loadPage(URL) {
	const XHR = new XMLHttpRequest();
	XHR.onload = insertPage(XHR.response, URL);
	XHR.open("GET", URL);
	XHR.send(null);
}

// Insert asynchronously loaded page
function insertPage(page, url) {
	let mainColumn = /<div id="mainColumn">([\s\S]*)<input type="checkbox" id="hideImagesCheckbox"/.exec(page);
	document.querySelector('#mainColumn').innerHTML = mainColumn[1];

	let masterCSS = /<link rel="stylesheet" id="mainStylesheet" href="(.+)">/.exec(page);
	document.querySelector('#mainStylesheet').href = masterCSS[1];

	let title = /<title>(.+)<\/title>/.exec(page);
	document.querySelector('title').innerHTML = title[1];
	
	history.pushState({}, title, url);
}

// Bind ajax page loading to all link clicks
document.querySelector('body').onclick = e => {
	if(e.target.nodeName == 'A' && e.target.href){
		e.preventDefault();
		loadPage(e.target.href);
	}
}