const settings = {
	init: function() {
		settings.wrapper = sel(["[data-tab=basicSettings]"])

		settings.addOption("USEAJAX", "Использовать AJAX")
		settings.addOption("SHANIMA", "Показывать анимации")

		INITIALIZED_SCRIPTS.push("settings")
	},

	initConfig: function() {
		this.storage = new Storage({
			defaults: {
				settings: {
					"USEAJAX": true,
					"SHANIMA": true
				}
			}
		})

		// let config = this.storage.get("settings")
		let config = { //TODO: Тут даже комментарии излишни
			"SHANIMA": this.storage.get("settings.SHANIMA"), 
			"USEAJAX": this.storage.get("settings.USEAJAX")
		}

		for (variable in config) {
			this.setOption(variable, config[variable])
		}
	},

	addOption: function(id, description) {
		let node = createElement("label", {
			innerText: description
		}),
			input = createElement("input", {
			id
		})

		let value = this.storage.get(`settings.${id}`)

		if (typeof value == "boolean") {
			input.type = "checkbox"
			input.classList.add("switch")
			input.checked = value

			let toggle = createElement("span", {
				className: "switch"
			})

			node.appendChild(input)
			node.appendChild(toggle)
		} else {
			input.type = "text"
			input.value = value
			node.appendChild(input)
		}

		this.wrapper.appendChild(node)
	},

	setOption: function(id, value) {
		console.log("Setting option", id, "to", value)
		this.storage.set(`settings.${id}`, value)

		switch (id) {
			case "SHANIMA":
				document.documentElement.style.setProperty("--animationDuration", value ? ".3s" : "0s")
				break
		}
	},

	toggleOption: function(event) {
		let id = event.target.id
		if (!id) return

		let value = this.storage.get(`settings.${id}`)
		if (typeof value == "boolean") {
			this.setOption(id, !value)
		}
	},

	getOption: function(id) {
		return this.storage.get(`settings.${id}`)
	}
}