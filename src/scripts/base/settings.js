const settings = {
	initedTabs: [],

	init: (name = "basicSettings") => {
		settings.wrapper = sel(["div[data-tab=" + name + "]"]);

		switch (name) {
			case "securitySettings":
				settings.addOptions({
					id: "PASSWD",
					description: "Пароль",
					options: {
					type: "password",
					// form: "replyForm deletePosts"
					}
				});
				break;
			case "spoilingSettings":
			case "testing":
				//
				break;
			case "basicSettings":
				let loadedModules = storage.get(`settings.modules`)

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
				}, {
					id: "quickSave",
					description: "Быстрое сохранение файлов"
				}].filter(module => !loadedModules.includes(module.id)))

				sel("#settings").addEventListener("settingsTabInit", e => {
					let tab = e.detail.name;
					if (!settings.initedTabs.includes(tab)) {
					settings.init(tab);
					}
				}, false);

				if (loadedModules.includes("themes")) themes.initInterface()
				INITIALIZED_SCRIPTS.push("settings")
				break;
		}

		settings.initedTabs.push(name);
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

			for (let key in option.options || {}) {
				input[key] = option.options[key];
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

			loader.request(`/js/${id}.js`)
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
	},

	addTab: function (id, title) {
		let label = createElement("label", {
			onclick: () => settings.switchToTab(id),
			innerText: title
		}), div = createElement("div", {
			hidden: 1
		})

		label.dataset.tab = id
		div.dataset.tab = id

		sel("#settings .widgetBox").appendChild(div)
		sel("#settings .tabs").appendChild(label)
		
		return div
	},

	switchToTab: function (name) {
		let newTab = sel(`#settings div[data-tab="${name}"]`),
			oldTab = sel("#settings div[data-tab]:not([hidden])"),
			tabsList = sel("#settings .tabs")

		if (newTab.hasAttribute("hidden")) {
			oldTab.setAttribute("hidden", 1)
			newTab.removeAttribute("hidden")

			tabsList.querySelector(".active").classList.remove("active")
			tabsList.querySelector(`label[data-tab=${name}]`).classList.add("active")

			let event = new CustomEvent("settingsTabInit", {detail: { name }});
			sel("#settings").dispatchEvent(event);
		}
	}
};
