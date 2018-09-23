themes = {
	init: async function () {
		storage.defaults.themes = {
			current: "tumbach"
		}
		
		let name = storage.get("themes.current"),
			json = storage.get(`themesCache.${name}`) || await this.load(name)

		this.apply(json)
	},

	initInterface: function () {
		let tabId = "themes"
		this.wrapper = settings.addTab(tabId, "Темы")

		settings.addOption("themes.current", "Standart", 	tabId, 0, 1, "tumbach")
		settings.addOption("themes.current", "Crychan", 	tabId, 0, 1, "crychan")
		settings.addOption("themes.current", "Sosach", 		tabId, 0, 1, "sosach")
		settings.addOption("themes.current", "One Dark", 	tabId, 0, 1, "oneDark")
		settings.addOption("themes.current", "Classic", 	tabId, 0, 1, "tumbachClassic")
	},

	load: async function (name) {
		return fetch(`${window.location.origin}/themes/${name}.json`)
			.then(response => {
				if (response.status == 200) {
					return response.json()
							.then(data => {
								// storage.set(`themesCache.${name}`, data)
								return data
							})
				} else {
					throw response.status
				}
			})
			.catch(err => console.error("Theme fetch error occured:", err))
	},

	apply: function (object, updateEditor = 1) {
		for (let rule in object) {
			document.documentElement.style.setProperty(`--${rule}`, object[rule])
		}
	},

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