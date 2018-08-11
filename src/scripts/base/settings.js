const settings = {
	init: function() {
		settings.wrapper = sel(["[data-tab=basicSettings]"])

		settings.addOption("USEAJAX", "Использовать AJAX")
		settings.addOption("ANIDUR", "Длительность анимаций")

		INITIALIZED_SCRIPTS.push("settings")
	},

	addOption: function(id, description) {
		let node = createElement("label", {
			innerText: description
		}),
			input = createElement("input", {
			id
		})
		let value = this.getOption(id)

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
		storage.set(`settings.${id}`, value)

		switch (id) {
			case "ANIDUR":
				document.documentElement.style.setProperty("--animationDuration", `${value}s`)
				break
		}
	},

	updateOption: function(target) {
		let id = target.id,
			currentValue = this.getOption(id)
		
		if (typeof currentValue == "boolean") {
			this.setOption(id, target.checked)
		} else{
			this.setOption(id, target.value)
		}
	},

	getOption: id => storage.get(`settings.${id}`)
}
