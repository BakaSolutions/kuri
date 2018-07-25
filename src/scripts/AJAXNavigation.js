function asyncLoadPage(uri, noScrolling) {
	if (uri == "/" || !settings.getOption("USEAJAX")) return location.href = uri

	let ntf = notifications.add({
		text: "Загрузка...",
		class: 'notification',
		closable: false
	})

	console.log(uri);

	fetch(uri)
		.then(response => {
			notifications.remove(ntf)

			if (response.status == 200) {
				return response.text()
					.then(data => {
						let doc = (new DOMParser()).parseFromString(data, "text/html")

						let main = doc.querySelector("main")
						if (main) sel("main").innerHTML = main.innerHTML

						let title = doc.querySelector("title")
						sel("title").innerHTML = title.innerHTML
						history.pushState({uri}, title, uri)

						if (sel("#replyForm") && doc.querySelector("#replyForm")) {
							sel("#replyForm .widgetHandle").innerHTML = doc.querySelector("#replyForm .widgetHandle").innerHTML
							sel("#postForm").innerHTML = doc.querySelector("#postForm").innerHTML
						}

						let postMenu = sel("#postMenu:not([hidden])")
						if(postMenu) postMenu.setAttribute("hidden", 1)

						initHiddenPosts()

						// Скролл к указанному хэшу либо по-умолчанию вверх
						if (!noScrolling) {
							sel(`a[name=${uri.includes("#") ? uri.split("#")[1] : "top"}]`).scrollIntoView({behavior: settings.getOption("SHANIMA") ? "smooth" : "instant"})
						}

						// console.log("Asynchronously navigated to", uri)
						// sel("main").classList.remove("refreshing")
					})
			} else {
				throw response.status
			}
		})
		.catch(err => {
			console.log("error:", err)
			ntf = notifications.add({
				text: "Не удалось загрузить страницу.<br>" + JSON.stringify(err),
				class: "error",
				timeout: 10000
			})
		})
}

(() => { // Бинд кликов
	sel('body').onclick = (e) => {
		if (e.target.hasAttribute('href')){
			let uri = e.target.getAttribute('href').replace(window.location.host, "")

			if(/^(\/|#)/.test(uri) && !e.target.hasAttribute('download')){
				e.preventDefault()

				if (/^\//.test(uri)) asyncLoadPage(uri) // Внутренние ссылки
				else if (/^\#/.test(uri)){				// Ссылки на якоря
					sel(`a[name=${uri.split("#")[1]}]`).scrollIntoView({behavior: settings.getOption("SHANIMA") ? "smooth" : "instant"})
				}
			}
		}
	}
})()
