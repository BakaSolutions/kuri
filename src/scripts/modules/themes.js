async function initThemes (){
	let name = localStorage.getItem("theme") || "tumbach",
		json = localStorage.getItem(`theme-${name}`) || await loadTheme(name)

	applyTheme(json)
	switchThemeSelector(document.querySelector(`[data-theme="${name}"]`), 1)
}

async function loadTheme(name) {
	return fetch(`${window.location.origin}/themes/${name}.json`)
		.then(response => {
			if (response.status == 200) {
				return response.text()
						.then(data => {
							localStorage.setItem(`theme-${name}`, data)
							return data
						})
			} else {
				throw response.status
			}
		})
		.catch(err => console.error("Theme fetch error occured:", err))
}

async function selectTheme(event) {
	let name = event.target.dataset.theme,
		json = name == "custom" ? parseCustomTheme(event) : localStorage.getItem(`theme-${name}`) || await loadTheme(name)

	applyTheme(json)
	switchThemeSelector(event.target)
	localStorage.setItem("theme", name)
}

function applyTheme(json, updateEditor = 1) {
	let object = JSON.parse(json)

	for (let rule in object) {
		if (updateEditor) document.querySelector(`#themeEditor [name="${rule}"]`).value = object[rule]
		document.documentElement.style.setProperty(`--${rule}`, object[rule])
	}
}

function parseCustomTheme(){
	let object = {}

	for (let input of document.querySelectorAll("#themeEditor input")) {
		object[input.name] = input.value
	}

	let json = JSON.stringify(object)
	localStorage.setItem("theme-custom", json)
	return json
}

function switchThemeSelector(activate, initial) {
	if (!initial){
		let deactivate = document.querySelector("#themes .active")

		if (deactivate != activate){
			deactivate.classList.remove("active")
		}
	}

	if (!activate.classList.contains("active")){
		activate.classList.add("active")
	}
}

initThemes()