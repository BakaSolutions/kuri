const config = {
	fileUpload: {
		maxFiles: 3,
		allowedTypes: ["image/jpeg", "image/png", "image/gif", "video/webm", "image/webp"]
	}
}

function createElement (tagName, attributes = {}){
	let element = document.createElement(tagName);
	for (let attr in attributes) {
		element[attr] = attributes[attr];
	}

	return element
}

function loadPage(URL) {
	const XHR = new XMLHttpRequest();
	XHR.onload = () => {
		const MAIN_COLUMN = /(<div id="mainColumn">[\s\S]*)<div id="rightTopCorner">/.exec(XHR.response);
		document.querySelector('#mainColumn').outerHTML = MAIN_COLUMN[1];

		const TITLE = /<title>(.+)<\/title>/.exec(XHR.response);
		document.querySelector('title').innerHTML = TITLE[1];
		history.pushState({}, TITLE, URL);
	};
	XHR.open("GET", URL);
	XHR.send(null);
}

document.querySelector('body').onclick = e => {
	if(e.target.nodeName == 'A' && e.target.href){
		e.preventDefault();
		loadPage(e.target.href);
	}
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
};
