const config = {
	fileUpload: {
		maxFiles: 3,
		allowedTypes: ["image/jpeg", "image/png", "image/gif", "video/webm", "image/webp"]
	}
}

window.onload = e => {
	replyFormInit();
	initFileInput();
});
