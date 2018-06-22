const log = async (...text) => settingsManager.get('logging') ? console.log(...text) : 0;
const switchAttribute = (el, attr) => el.getAttribute(attr) != null ? el.removeAttribute(attr) : el.setAttribute(attr, true);

const settingsManager = {
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
};


function scrollTo(name){
	log('Scrolling to', name);

	if (!settingsManager.get('smoothScrolling')){
		document.getElementsByName(name)[0].scrollIntoView();
	} else{
		let elementY = window.pageYOffset + document.getElementsByName(name)[0].getBoundingClientRect().top,
				startingY = window.pageYOffset,
				diff = elementY - startingY,
				start,
				duration = Math.abs(diff / 3);

	  window.requestAnimationFrame(function step(timestamp) {
	    start = start || timestamp;

	    let time = timestamp - start,
					percent = Math.min(time / duration, 1)

	    window.scrollTo(0, startingY + diff * percent);

	    if (time < duration) window.requestAnimationFrame(step);
	  })
	}
}

async function createElement(nodeName, params) {
	let node = document.createElement(nodeName);
	for (let i in params) node[i] = params[i];

	return node
}

function truncate(fullStr, strLen) {
	if (fullStr.length <= strLen) return fullStr;

	let charsToShow = strLen - 3,
			frontChars = Math.ceil(charsToShow/2),
			backChars = Math.floor(charsToShow/2);

	return fullStr.substr(0, frontChars) + '...' + fullStr.substr(fullStr.length - backChars);
}

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

function sel(selector){
	let e = document.querySelectorAll(selector);

	if (e.length){
		return e.length > 1 ? e : e[0];
	}
}

settingsManager.init();

function zoomImage(img, multiplier){
	const MAX_SIZE = window.innerWidth * 3,
				MIN_SIZE = window.innerHeight / 10;

	let newHeight = multiplier * parseInt(img.style.height),
	 		newWidth = multiplier * parseInt(img.style.width)

	if (newHeight < MAX_SIZE && newWidth < MAX_SIZE && newHeight > MIN_SIZE && newWidth > MIN_SIZE) {
		img.style.height = newHeight + "px"
		img.style.width = newWidth + "px"
	} else{
		console.error("Trying to set width to", newWidth, "and height to", newHeight,
									"when minimum limit is", MIN_SIZE, "and maximum limit is", MAX_SIZE)
	}
}

// Hotkeys
(() => {
	document.onkeydown = (e) => {
		// console.log("Button pushed: ", e.key)
		let img = sel('#imageViewer .widgetBox img')

		switch (e.key) {
			case "+":
				if (e.shiftKey && img) zoomImage(img, 1.2);
				break;
			case "-":
				if (!e.shiftKey && img) zoomImage(img, 0.8);
				break;
			case "Escape":
				if (sel('.widget#imageViewer:not([hidden])')) switchAttribute(sel('.widget#imageViewer'), 'hidden')
				break;
			case "F5":
				if (!e.ctrlKey) {
					e.preventDefault();
					asyncLoadPage(document.location.href, 1);
				}
				break;
		}
	}
})()
