const DEVICE = window.innerWidth > 450 ? "desktop" : "mobile"

const settingsManager = { // TODO: Сделать это чудо рабочим и отрефакторить
	defaultSettings: {
		// Basic
		AJAXNavigation: 1,
		smoothScrolling: 0,
		showJumpButtons: 1,
		logging: 0,

		// Posts
		showNSFW: 0,
		maskNSFW: 0,
		useLocalTime: 1,
		useRelativeTime: 1,
		autoRefresh: 1,
		markOwnPosts: 1,

		// Posting
		noko: 1,
		markup: 0b111,
		AJAXPosting: 1,
		rememberInputValues: 1
	},

	settings: {},

	init: function(){
		this.settings = localStorage.settings ? JSON.parse(localStorage.settings) : {};

		for (let field in this.defaultSettings) {
			if (this.settings[field] === undefined) this.set(field, this.defaultSettings[field]);
		}
	},

	set: function(field, value){ // settingsManager.set('hello world', true)
		this.settings[field] = value;
		localStorage.settings = JSON.stringify(this.settings);
	},

	get: function(field){
		return this.settings[field];
	},

	toggle: function(field){
		this.set(field, !this.get(field))
	}
}

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

function sel(selector){
	let e = document.querySelectorAll(selector);

	if (e.length){
		return e.length > 1 ? e : e[0];
	}
}

settingsManager.init();

// Hotkeys
(() => {
	document.onkeydown = (e) => {
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
			case "F5":
				if (!e.ctrlKey) {
					e.preventDefault();
					asyncLoadPage(document.location.href, 1)
				}
				break
		}
	}
})()
