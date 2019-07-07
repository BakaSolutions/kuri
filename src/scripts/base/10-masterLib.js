const DEVICE = window.innerWidth > 450 ? "desktop" : "mobile"
const INITIALIZED_SCRIPTS = []

function createElement(nodeName, params) {
	let node = document.createElement(nodeName)
	for (let i in params) node[i] = params[i]

	return node
}

String.prototype.truncate = function truncate(targetLength) {
	if (this.length <= targetLength) return this

	let charsToShow = targetLength - 3,
	frontChars = Math.ceil(charsToShow / 2),
	backChars = Math.floor(charsToShow / 2)

	return this.substr(0, frontChars) + "..." + this.substr(this.length - backChars)
}

if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength, padString) {
		targetLength = targetLength >> 0;
		padString = String(padString || ' ');
		if (this.length > targetLength) return String(this)
		else {
			targetLength = targetLength - this.length;
			if (targetLength > padString.length) padString += padString.repeat(targetLength/padString.length);

			return padString.slice(0, targetLength) + String(this);
		}
	}
}

function sel(selector = '', dom = document){
	let e = dom.querySelectorAll(selector);

	return e.length > 1 ? e : e[0];
}

// Hotkeys
document.onkeydown = e => {
	// console.log("Button pushed: ", e.key)

	switch (e.key) {
		case "+":
			media.zoom(1.2)
			break
		case "-":
			media.zoom(0.8)
			break
		case "Escape":
			if (sel("#mediaViewer:not([hidden])")) toggleWidget("mediaViewer")
			break
		case "Enter":
			if (e.ctrlKey && sel("#replyFormShow").checked) handlePostSend(e)
			break
		case "F5":
			if (!e.ctrlKey) {
				e.preventDefault();
				asyncLoadPage(document.location.href, 1)
			}
			break
	}
}

function handleAttachmentClick(event){
	let { target, ctrlKey } = event
	if (!('mime' in target.dataset)) {
		target = target.parentNode
	}
	if (["thumbnails", "attachments"].includes(target.parentNode.className) && !ctrlKey && DEVICE === "desktop") {
		let { href, dataset } = target
		let { mime, name } = dataset
		let type = mime.split("/")[0]

		switch (type) {
			case "audio":
				let evt = new CustomEvent(`click.attachment.audio`, { detail: [href, mime, name], bubbles: true, cancelable: true })
				let cancelled = !target.dispatchEvent(evt)
				if (cancelled) {
					event.preventDefault()
				}
			break;
			case "image":
			case "video":
				event.preventDefault()
				media.prepare(href, mime, name)
		}
	}
}