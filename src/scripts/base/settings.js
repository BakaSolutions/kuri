const settings = {
	init: function() {
		let loadedModules = storage.get(`settings.modules`)
		settings.wrapper = sel(["[data-tab=basicSettings]"])

		settings.addOptions({
			id: "USEAJAX", 
			description: "Использовать AJAX"
		}, {
			id: "ANIDUR", 
			description: "Длительность анимаций"
		})

		settings.addModules(...[{
			id: "themes", 
			description: "Темы"
		}].filter(module => !loadedModules.includes(module.id)))

		if (loadedModules.includes("themes")) themes.initInterface()
		INITIALIZED_SCRIPTS.push("settings")
	},

	addSeparator: function(innerText) {
		this.wrapper.appendChild(createElement("span", {innerText}))
	},

	addOptions: function(...options) {
		this.addSeparator("Опции:")

		for (option of options) {
			let id = option.id,
				description = option.description

			let node = createElement("label", {
				innerText: description
			}),
				input = createElement("input", {
				id
			})
			let value = this.getOption(id)

			node.dataset.optionId = id

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
		}
	},

	addModules: function(...modules) {
		if (!modules[0]) return
			
		this.addSeparator("Модули:")

		for (module of modules) {
			let id = module.id,
				description = module.description

			let node = createElement("label", {
				innerText: description
			}),
				input = createElement("input", {
				type: "checkbox",
				classList: "switch",
				id
			})
			let value = this.getOption(id)

			node.dataset.option = "loadModule"
			node.dataset.optionId = id
			let toggle = createElement("span", {
				className: "switch"
			})

			node.appendChild(input)
			node.appendChild(toggle)

			this.wrapper.appendChild(node)
		}
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
		let id = target.id

		if (target.parentNode.dataset.option == "loadModule"){
			let modules = this.getOption("modules")
			modules.push(id)

			this.setOption("modules", modules)

			this.hideModule(id)
			loader.request(`/js/${id}.js`, "themes.initInterface()")
		} else{
			let currentValue = this.getOption(id)
		
			if (typeof currentValue == "boolean") {
				this.setOption(id, target.checked)
			} else{
				this.setOption(id, target.value)
			}
		}
	},

	getOption: id => storage.get(`settings.${id}`),

	hideModule: function(id) {
		this.wrapper.removeChild(this.wrapper.querySelector(`[data-option-id=${id}]`))
	}
}
