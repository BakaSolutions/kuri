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
		const BODY = /<body[\s\S]*<\/body>/.exec(XHR.response);
		document.querySelector('body').outerHTML = BODY[0];

		const TITLE = /<title>(.+)<\/title>/.exec(XHR.response);
		document.querySelector('title').innerHTML = TITLE[1];
		history.pushState({}, TITLE, URL);
	};
	XHR.open("GET", URL);
	XHR.send(null);
}
