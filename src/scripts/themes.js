function initThemes (){
	if (localStorage.theme) applyTheme(localStorage.theme)
}

async function loadTheme(uri) {
	uri = window.location.origin + uri

	console.log("Loading theme from ", uri)

	let xhr = new XMLHttpRequest()

	xhr.onload = (e) => {
		if (xhr.status < 400){
			applyTheme(xhr.response)
		}
	}
	xhr.onerror = (e) => console.log("Error: ", uri, xhr, e);

	xhr.open('GET', uri);
	xhr.send(null);

	// (async () => {
	// 	localStorage.theme = JSON.stringify(cssObj);
	// 	EDITOR.value = (() => {
	// 		let styleString = '';
	// 		for (let key in cssObj) styleString += `${key}: ${cssObj[key]}\n`;
	// 		return styleString;
	// 	})();
    //
	// 	return cssObj
	// })().then(cssObj => {
	// 	let css = ':root{';
	// 	for (let key in cssObj) css += `--${key}:${cssObj[key]};`;
	// 	css += '}';
    //
	// 	let node = sel('#theme');
	// 	if (node) node.innerHTML = css
	// 	else{
	// 		createElement('style', {
	// 			'type': 'text/css',
	// 			'innerHTML': css,
	// 			'id': 'theme'
	// 		}).then(el => sel('head').appendChild(el))
	// 	}
	// })
}

// const EDITOR = document.querySelector('#themeEditor');
//
// EDITOR.onchange = async () => {
// 	let cssObj = {};
// 	for (str of EDITOR.value.split('\n')) {
// 		if (str) {
// 			let splited = str.split(': ');
// 			cssObj[splited[0]] = splited[1];
// 		}
// 	};
//
// 	setTheme(cssObj);
// };

function applyTheme(json) {
	localStorage.theme = json
	let object = JSON.parse(json)

	for (let rule in object) {
		document.documentElement.style.setProperty(`--${rule}`, object[rule])
	}
}
