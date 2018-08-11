themes = {
	init: async function () {
		let name = localStorage.getItem("theme") || "tumbach",
			json = localStorage.getItem(`theme-${name}`) || await this.load(name)

		this.apply(json)
		// this.switchSelector(document.querySelector(`[data-theme="${name}"]`), 1)
	},

	initInterface: function () {
		// this.wrapper = 
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

		sel("[data-tab=themes]").appendChild(this.showcase)

		sel("label[data-module=themes]").removeAttribute("hidden")
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
	},

	select: async function (event) {
		let name = event.target.dataset.themeId,
			json = name == "custom" ? themes.parse(event) : localStorage.getItem(`theme-${name}`) || await themes.load(name)

		themes.apply(json)
		// themes.switchSelector(event.target)
		localStorage.setItem("theme", name)
	},

	apply: function (json, updateEditor = 1) {
		let object = JSON.parse(json)

		for (let rule in object) {
			// if (updateEditor) document.querySelector(`#themeEditor [name="${rule}"]`).value = object[rule]
			document.documentElement.style.setProperty(`--${rule}`, object[rule])
		}
	},

	parse: function (){
		let object = {}

		for (let input of document.querySelectorAll("#themeEditor input")) {
			object[input.name] = input.value
		}

		let json = JSON.stringify(object)
		localStorage.setItem("theme-custom", json)
		return json
	},

	switchSelector: function (activate, initial) {
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
}

themes.init()
if (INITIALIZED_SCRIPTS.includes("settings")) themes.initInterface()