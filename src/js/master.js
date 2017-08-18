const config = {
	fileUpload: {
		maxFiles: 3,
		allowedTypes: ["image/jpeg", "image/png", "image/gif", "video/webm", "image/webp"]
	}
}

function clear(target) {
	target.innerHTML = '';
}

function remove(target) {
	target.outerHTML = '';
}

function select(e){
	return document.querySelector(e);
}

function init(){
	replyFormInit();
	initFileInput();
}
