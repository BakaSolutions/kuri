let log = async (...text) => document.location.hostname == 'localhost' ? console.log(...text) : 0;
let switchAttribute = (el, attr) => el.getAttribute(attr) != null ? el.removeAttribute(attr) : el.setAttribute(attr, true);

// Settings manager
let settingsManager = {
	defaultSettings: {
		// Basic
		AJAXNavigation: 1,
		smoothScrolling: 0,
		showJumpButtons: 1,

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


let scrollTo = (name) => {
	if (!settingsManager.get('smoothScrolling')){
		document.getElementsByName(name)[0].scrollIntoView();
		log('Scrolling to', '#' + name);

		return;
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

		log('Scrolling smoothly to', '#' + name);
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
