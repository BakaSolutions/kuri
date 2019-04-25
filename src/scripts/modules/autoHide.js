autoHide = {
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
					let text = post.querySelector('.postText').innerText

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
				let wordBoundary = "[\n\r .,?!]", // "\b" doesn't support unicode so yes
					wordRegExpString = `${wordBoundary}(${storage.get("settings.autoHide.words").split(",").map((el) => `(${el.trim()})`).join("|")})${wordBoundary}`

				this.wordRegExp = new RegExp(wordRegExpString, "i")
				this.naturalRegExp = new RegExp(storage.get("settings.autoHide.regexp"), "i")
			} catch(error){
				console.log(error)
			}
		} else{
			try{
				if (event.detail.id == "settings.autoHide.words") {
					this.wordRegExp = new RegExp(event.detail.value.split(",").map((el) => `(${el.trim()})`).join("|"), "i")
				} else if (event.detail.id == "settings.autoHide.regexp"){
					this.naturalRegExp = new RegExp(event.detail.value, "i")
				}
			} catch(error) {
				console.log(error)
			}
		}
	}
}

autoHide.updateFilters(null, true)
autoHide.checkPosts(...document.querySelectorAll(".post"))