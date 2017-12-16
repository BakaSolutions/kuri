let log = async (...text) => document.location.hostname == 'localhost' ? console.log(...text) : 0;
let switchAttribute = (el, attr) => el.getAttribute(attr) != null ? el.removeAttribute(attr) : el.setAttribute(attr, true);

let scrollTo = (name) => {
	if (!JSON.parse(localStorage.smoothScrolling)){
		document.getElementsByName(name)[0].scrollIntoView();
		log('Scrolling to', '#' + name);
		return;
	}

	log('Scrolling smoothly to', '#' + name);

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
		if (e.length < 2) return e[0]
		else return e
	}
}
