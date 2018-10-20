if (!storage.get("settings.password")){
	let password = []
	while(password.length < 16){
		password.push(String.fromCharCode(Math.floor(Math.random() * 90) + 33))
	}

	storage.set("settings.password", password.join(""))
}

const settings = {
	init: () => {
		settings.widgetBox = sel("#settings .widgetBox")
		settings.tabSwitcher = createElement("div", {
			onclick: e => settings.switchTab(e.target.dataset.tab),
			className: "tabs"
		})

		settings.widgetBox.appendChild(settings.tabSwitcher)

		settings.addTab("basic", "Общее", 1)
		settings.addTab("security", "Безопасность")
		settings.addTab("addons", "Расширения")

		if (storage.get("addons.themes")) themes.initInterface()
	},

	addTab: function (id, title, activeAsDefault) {
		let span = createElement("span", {
			className: activeAsDefault ? "active" : "",
			innerText: title
		}), div = createElement("div", {
			hidden: !activeAsDefault
		})

		span.dataset.tab = id
		div.dataset.tab = id

		settings.tabSwitcher.appendChild(span)
		settings.widgetBox.appendChild(div)

		settings.initTab(id)
	},

	initTab: function(id) {
		switch (id) {
			case "basic":
				settings.addOption("settings.useAjax", "Использовать AJAX", 			id)
				settings.addOption("settings.animationLength", "Длительность анимаций", id)

				settings.addOption("settings.quickReply.navigateTo", "Переходить на страницу поста при ответе",		id)
				settings.addOption("settings.quickReply.addSelection", "Копировать выделенное при ответе",			id)
				settings.addOption("settings.quickReply.insertAtCursor", "Учитывать положение курсора при ответе",	id)

				break
			case "security":
				settings.addOption("settings.password", "Пароль", id, {
					form: "replyForm deletePosts",
					type: "password"
				})

				break
			case "addons":
				settings.addOption("addons.themes", "Темы", 						id)
				settings.addOption("addons.quickSave", "Быстрое сохранение файлов", id)
				settings.addOption("addons.floatingPosts", "Плавающие посты", 		id)

				break
		}
	},

	addOption: function(id, description, tabId, options = {}, refresh, value){
		let input = createElement("input"),
			wrapper = createElement("div", {innerText: description})

		let currentValue = storage.get(id)

		if (typeof currentValue == "boolean" || value !== undefined) {
			wrapper.onclick = (event) => {
				if (event.target.nodeName == "DIV") input.click()
			}

			wrapper.style.cursor = "pointer"

			input.type = "checkbox"
			input.checked = currentValue

			if (value !== undefined) input.hidden = "1"
		} else{
			input.type = "text"
			input.value = currentValue
		}

		for (o in options) input[o] = options[o]

		input.onchange = (event) => {
			settings.set(id, value || (typeof currentValue == "boolean" ? event.target.checked : event.target.value))
			if (refresh) window.location.reload(true)
		}

		wrapper.appendChild(input)
		sel(`div[data-tab="${tabId}"]`, settings.widgetBox).appendChild(wrapper)
	},

	switchTab: function(id) {
		let newTab = sel(`div[data-tab="${id}"]`, settings.widgetBox)
		if (newTab.hasAttribute("hidden")) {
			let oldTab = sel("div[data-tab]:not([hidden])", settings.widgetBox)
			oldTab.setAttribute("hidden", "")
			newTab.removeAttribute("hidden")

			sel(".active", settings.tabSwitcher).className = ""
			sel(`[data-tab=${id}]`, settings.tabSwitcher).className = "active"
		}
	},

	set: function(id, value) {
		console.log("Setting", id, "to", value)
		storage.set(id, value)
	}
}
