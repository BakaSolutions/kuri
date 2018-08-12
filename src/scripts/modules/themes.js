themes = {
	init: async function () {
		storage.defaults.settings.theme = "tumbach"
		storage.defaults.themes = []
		
		let name = storage.get("settings.theme"),
			json = storage.get(`themes.${name}`) || await this.load(name)

		this.apply(json)
	},

	initInterface: function () {
		this.wrapper = settings.addTab("themes", "Темы")
		this.showcase = createElement("div", {
			id: "themes",
			onclick: this.select
		})

		this.addToShowcase({
			id: "tumbach",
			description: "Standart"
		}, {
			id: "crychan",
			description: "Crychan"
		}, {
			id: "sosach",
			description: "Sosach"
		}, {
			id: "oneDark",
			description: "One Dark"
		}, {
			id: "tumbachClassic",
			description: "Tumbach Classic"
		})

		this.wrapper.appendChild(this.showcase)
		this.switchSelector(sel(`[data-theme-id=${storage.get("settings.theme")}]`), 1)
	},

	addToShowcase: function (...themes) {
		for (theme of themes) {
			let node = createElement("div", {
				innerText: theme.description
			})

			node.dataset.themeId = theme.id

			this.showcase.appendChild(node)
		}
	},

	load: async function (name) {
		return fetch(`${window.location.origin}/themes/${name}.json`)
			.then(response => {
				if (response.status == 200) {
					return response.json()
							.then(data => {
								storage.set(`themes.${name}`, data)
								return data
							})
				} else {
					throw response.status
				}
			})
			.catch(err => console.error("Theme fetch error occured:", err))
	},

	select: async function (event) {
		let name = event.target.dataset.themeId,
			json = name == "custom" ? themes.parse(event) : storage.get(`themes.${name}`) || await themes.load(name)

		themes.apply(json)
		themes.switchSelector(event.target)
		storage.set("settings.theme", name)
	},

	apply: function (object, updateEditor = 1) {
		for (let rule in object) {
			// if (updateEditor) document.querySelector(`#themeEditor [name="${rule}"]`).value = object[rule]
			document.documentElement.style.setProperty(`--${rule}`, object[rule])
		}
	},

	// parse: function (){
	// 	let object = {}

	// 	for (let input of document.querySelectorAll("#themeEditor input")) {
	// 		object[input.name] = input.value
	// 	}

	// 	let json = JSON.stringify(object)
	// 	storage.set("themes.custom", json)
	// 	return json
	// },

	switchSelector: function (activate, initial) {
		if (!initial){
			let deactivate = sel("#themes .active")

			if (deactivate != activate){
				deactivate.classList.remove("active")
			}
		}

		if (!activate.classList.contains("active")){
			activate.classList.add("active")
		}
	}
}

themes.init()
if (INITIALIZED_SCRIPTS.includes("settings")) themes.initInterface()