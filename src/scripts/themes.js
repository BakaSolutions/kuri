async function initThemes (){
	switchThemeSelector(document.querySelector(`[data-theme="${localStorage.getItem('theme') || 'tumbach'}"]`), 1)
	applyTheme(localStorage.getItem(`theme-${theme}`))
}

async function loadTheme(event) {
	let name = event.target.dataset.theme
	if (!name) return

	if (name == "custom"){
		parseCustomTheme(event)
	} else{
		localStorage.setItem("theme", name)
		let cached = localStorage.getItem(`theme-${name}`)

		if(cached){
			applyTheme(cached)
		} else{
			let uri = `${window.location.origin}/themes/${name}.json`,
				xhr = new XMLHttpRequest()

			xhr.onload = (e) => {
				applyTheme(xhr.response)
				localStorage.setItem(`theme-${name}`, xhr.response)
			}

			xhr.onerror = (e) => console.log("Error: ", uri, xhr, e)

			xhr.open("GET", uri)
			xhr.send(null)
		}
	}

	switchThemeSelector(event.target)
}

async function applyTheme(json, updateEditor = 1) {
	let object = JSON.parse(json)

	for (let rule in object) {
		if (updateEditor) document.querySelector(`#themeEditor [name="${rule}"]`).value = object[rule]
		document.documentElement.style.setProperty(`--${rule}`, object[rule])
	}
}

async function parseCustomTheme(event){
	let object = {}

	for (let input of document.querySelectorAll("#themeEditor input")) {
		object[input.name] = input.value
	}

	let json = JSON.stringify(object)

	applyTheme(json, 0)
	switchThemeSelector(event.target)
	localStorage.setItem("theme", "custom")
	localStorage.setItem("theme-custom", json)
}

async function switchThemeSelector(activate, initial) {
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
