const settings = {
	init: function() {
		settings.wrapper = sel(["[data-tab=basicSettings]"])

		settings.addOption("USEAJAX", "Использовать AJAX")
		settings.addOption("ANIDUR", "Длительность анимаций")

		INITIALIZED_SCRIPTS.push("settings")
	},

	initConfig: function() {
		this.storage = new Storage({
			defaults: {
				settings: {
					"USEAJAX": true,
					"ANIDUR": 0.3
				}
			}
		})

		// let config = this.storage.get("settings")
		let config = { //TODO: Тут даже комментарии излишни
			"ANIDUR": this.storage.get("settings.ANIDUR"), 
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
			case "ANIDUR":
				document.documentElement.style.setProperty("--animationDuration", `${value}s`)
				break
		}
	},

	updateOption: function(target) {
		// console.log(event)
		let id = target.id,
			currentValue = this.storage.get(`settings.${id}`)
		
		if (typeof currentValue == "boolean") {
			this.setOption(id, target.checked)
		} else{
			this.setOption(id, target.value)
		}
	},

	getOption: function(id) {
		return this.storage.get(`settings.${id}`)
	}
}