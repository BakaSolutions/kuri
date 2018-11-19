themes = {
	init: async function () {
		storage.defaults.themes = {
			current: "oneDark"
		}

		await this.setTheme()
	},

	setTheme: async function () {
		let name = storage.get("themes.current"),
			json = storage.get(`themes.cache.${name}`) || await this.load(name)
		this.apply(json)
	},

	initInterface: function () {
		let tabId = "themes"
		this.wrapper = settings.addTab(tabId, "Темы")
		this.wrapper.addEventListener('settings.themes.current', () => this.setTheme(), false)

		settings.addOption("themes.current", "One Dark", 		tabId, 0, 0, "oneDark")
		settings.addOption("themes.current", "Tumbach Classic", tabId, 0, 0, "tumbachClassic")
		settings.addOption("themes.current", "Crychan", 		tabId, 0, 0, "crychan")
		settings.addOption("themes.current", "Sosach", 			tabId, 0, 0, "sosach")
	},

	load: async function (name) {
		return fetch(`${window.location.origin}/themes/${name}.json`)
			.then(response => {
				if (response.status == 200) {
					return response.json()
							.then(data => {
								// storage.set(`themes.cache.${name}`, data)
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