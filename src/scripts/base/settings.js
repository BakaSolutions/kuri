const settings = {
	wrapper: sel(["[data-tab=basicSettings]"]),

	init: function() {
		// settings.addOption("LOCTIME", "Использовать локальное время", true)
		// settings.addOption("RELTIME", "Отображать относительное время", true)
		settings.addOption("USEAJAX", "Использовать AJAX")
		// settings.addOption("UNSPTXT", "Раскрывать спойлеры", false)
		// settings.addOption("UNSPPCS", "Раскрывать картнки под спойлерами", false)
		settings.addOption("SHANIMA", "Показывать анимации")

		INITIALIZED_SCRIPTS.push("settings")
	},

	addOption: function(id, description) {
		let node = document.createElement("div")
		node.dataset.optionId = id
		node.innerText = description

		settings.wrapper.appendChild(node)
		if (settings.getOption(id)) settings.setOption(id, true)
	},

	getDefaultOption: function(id){
		return ["LOCTIME", "RELTIME", "USEAJAX", "SHANIMA"].includes(id)
	},

	getOption: function(id){
		let object = JSON.parse(localStorage.getItem("settings"))

		if (object != null && object[id] != undefined) {
			return object[id]
		} else {
			return settings.getDefaultOption(id)
		}
	},

	setOption: function(id, value) {
		let object = JSON.parse(localStorage.getItem("settings") || "{}")
		object[id] = value
		localStorage.setItem("settings", JSON.stringify(object))

		let node = settings.wrapper.querySelector(`[data-option-id=${id}]`),
			state = "active"
		value ? node.classList.add(state) : node.classList.remove(state)

		switch (id) {
			case "SHANIMA":
				document.documentElement.style.setProperty("--animationDuration", value ? ".3s" : "0s")
				break
		}
	},

	toggleOption: function(id) {
		settings.setOption(id, !settings.getOption(id))
	}
}