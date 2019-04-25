autoHide = {
	wordRegExp: null,
	naturalRegExp: null,

	init: function(){
		settings.addTab("autoHide", "Автоскрытие")
		settings.addOption("settings.autoHide.words", "Фильтр слов", "autoHide")
		settings.addOption("settings.autoHide.regexp", "Регулярное выражение", "autoHide")

		document.addEventListener("settingsChange", this.updateFilters)
	},

	checkPosts: function(...posts){
		for (post of posts) {
			if (post != undefined){
				try {
					let text = post.querySelector(".postText").innerText

					if(text.match(this.wordRegExp) || text.match(this.naturalRegExp)){
						marker.addMark(post.dataset.board, post.dataset.number, "hidden")
					}
				} catch(error) {
					console.log(error)
				}
			}
		}
	},

	updateFilters: function(event, fromStorage){
		if (fromStorage) {
			try{
				let [words, regexp] = [storage.get("settings.autoHide.words"), storage.get("settings.autoHide.regexp")]

				if (words) {
					let wordBoundary = "[\n\r .,?!]", // "\b" doesn't support unicode so yes
					wordRegExpString = `${wordBoundary}(${storage.get("settings.autoHide.words").split(",").map((el) => `(${el.trim()})`).join("|")})${wordBoundary}`

					this.wordRegExp = new RegExp(wordRegExpString, "i")
				}

				if (regexp) {
					this.naturalRegExp = new RegExp(regexp, "i")
				}
			} catch(error){
				console.log(error)
			}
		} else{
			try{
				let {id, value} = event.detail

				if (id == "settings.autoHide.words") {
					this.wordRegExp = value === "" ? null : new RegExp(value.split(",").map((el) => `(${el.trim()})`).join("|"), "i")
				} else if (id == "settings.autoHide.regexp"){
					this.naturalRegExp = value === "" ? null : new RegExp(value, "i")
				}
			} catch(error) {
				console.log(error)
			}
		}
	}
}

autoHide.updateFilters(null, true)
autoHide.checkPosts(...document.querySelectorAll(".post:not([data-marks~='hidden']):not([data-marks~='own'])"))