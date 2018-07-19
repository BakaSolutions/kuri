function initThemes (){
	if (localStorage.theme) applyTheme(localStorage.theme)
}

async function loadTheme(uri) {
	if (uri) {
		uri = window.location.origin + uri

		console.log("Loading theme from ", uri)

		let xhr = new XMLHttpRequest()

		xhr.onload = (e) => applyTheme(xhr.response)
		xhr.onerror = (e) => console.log("Error: ", uri, xhr, e)

		xhr.open("GET", uri)
		xhr.send(null)
	} else{
		parseCustomTheme()
	}
}

function applyTheme(json) {
	localStorage.theme = json
	let object = JSON.parse(json)

	for (let rule in object) {
		document.querySelector(`#themeEditor [name="${rule}"]`).value = object[rule]
		document.documentElement.style.setProperty(`--${rule}`, object[rule])
	}
}

function parseCustomTheme(){
	let object = {}

	for (let input of document.querySelectorAll("#themeEditor input")) {
		object[input.name] = input.value
	}

	applyTheme(JSON.stringify(object))
}
