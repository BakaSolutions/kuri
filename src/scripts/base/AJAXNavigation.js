function asyncLoadPage(uri, noScrolling, noStateChange) {
	if (uri == "/" || !storage.get("settings.useAjax")) return location.href = uri

	let ntf = notifications.add({
		text: "Загрузка...",
		class: 'notification',
		closable: false
	})

	fetch(uri)
		.then(response => {
			notifications.remove(ntf)

			if (response.status == 200) {
				return response.text()
					.then(data => {
						let doc = (new DOMParser()).parseFromString(data, "text/html")

						let fields = ["subject", "text"],
							fieldValues = fields.map(f => sel(`#replyForm [name="${f}"]`).value)

						let main = sel("main", doc)
						if (main) sel("main").innerHTML = main.innerHTML

						for(let i in fields){
							sel(`#replyForm [name="${fields[i]}"]`).value = fieldValues[i]
						}

						let title = sel("title", doc)
						sel("title").innerHTML = title.innerHTML
						if (!noStateChange) history.pushState(uri, null, uri)

						let postMenu = sel("#postMenu:not([hidden])")
						if(postMenu) postMenu.setAttribute("hidden", 1)

						initInterface(1)

						// Скролл к указанному хэшу либо по-умолчанию вверх
						if (!noScrolling) {
							sel(`a[name="${uri.includes("#") ? uri.split("#")[1] : "top"}"]`).scrollIntoView({behavior: storage.get("settings.animationLength") > 0 ? "smooth" : "instant"})
						}

						// console.log("Asynchronously navigated to", uri)
						// sel("main").classList.remove("refreshing")
					})
			}

			throw response.status
		})
		.catch(err => {
			console.log(err)
			
			ntf = notifications.add({
				text: "Не удалось загрузить страницу.<br>" + JSON.stringify(err),
				class: "error",
				timeout: 10000
			})
		})
}

// Бинд кликов
sel("body").onclick = event => {
	let target = event.target;

	let uri = target.getAttribute("href")

	if (!uri && target.parentNode) {
		uri = target.parentNode.getAttribute("href") // Workaround for `undoQuickReply()`
	}

	if (!uri) return

	uri = uri.replace(window.location.host, "")

	if(/^(\.|\/|#)/.test(uri) && !target.hasAttribute("download")){
		event.preventDefault()

		if (/^\#/.test(uri) || (uri.includes("#") && uri.split("#")[0] == window.location.pathname)){
			document.querySelector(`a[name="${uri.split("#")[1]}"]`).scrollIntoView({behavior: storage.get("settings.animationLength") > 0 ? "smooth" : "instant"})
		} else if (/^(\.|\/)/.test(uri)) {
			asyncLoadPage(uri)
		}
	}
}

// История
history.replaceState(window.location.pathname, null, null)
window.addEventListener("popstate", e => asyncLoadPage(e.state, 0, 1))