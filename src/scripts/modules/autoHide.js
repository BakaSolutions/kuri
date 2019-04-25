autoHide = {
	wordArray: [],

	init: function(){
		console.log(2)
		settings.addTab("autoHide", "Автоскрытие")
		settings.addOption("settings.autoHide.words", "Фильтр слов", "autoHide")
		settings.addOption("settings.autoHide.regexp", "Регулярное выражение", "autoHide")

		document.addEventListener("settingsChange", this.eventHandler)
	},

	eventHandler: function(event){
		if (event.detail.id == "settings.autoHide.words") {
			this.wordArray = event.detail.value.split(",").map((el) => el.trim())
			settings.set("settings.autoHide.regexp", this.wordArray.map((el) => `(${el})`).join("|"))
		}
	}
}

