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
