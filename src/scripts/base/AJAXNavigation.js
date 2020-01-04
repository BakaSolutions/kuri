function asyncLoadPage(uri, noScrolling, noStateChange, silent = false) {
	if (uri == "/" || !storage.get("settings.useAjax")) return location.href = uri

	let ntf

	if (!silent) {
		ntf = notifications.add({
			text: "Загрузка...",
			class: 'notification',
			closable: false
		})
	}

	fetch(uri)
		.then(response => {
			if (!silent){
				notifications.remove(ntf)
			}

			if (response.status == 200) {
				return response.text()
					.then(data => {
						let doc = (new DOMParser()).parseFromString(data, "text/html")

						replyForm.toggleFloating(false)

						let oldRForm = sel("#replyFormWrapper"),
							newRForm = sel("#replyFormWrapper", doc)

						if (oldRForm && newRForm) {
							for (option of ["boardName", "redirect", "threadNumber"]) {
								replyForm.options[option] = sel(`#replyForm [name=${option}]`, newRForm).value
							}

							sel("input[name='subject']", oldRForm).placeholder = sel("input[name='subject']", newRForm).placeholder

							replyForm.setFInputLimit(sel("#fileInputs", newRForm).dataset.filelimit)

							sel(".widgetHandle", oldRForm).innerHTML = sel(".widgetHandle", newRForm).innerHTML
							newRForm.parentNode.replaceChild(oldRForm, newRForm)
						}

						let oldMain = sel("main"),
							newMain = sel("main", doc)

						if (oldMain && newMain) {
							oldMain.parentNode.replaceChild(newMain, oldMain)
						}

						let title = sel("title", doc)
						sel("title").innerHTML = title.innerHTML
						
						try {
							if (!noStateChange) history.pushState(uri, null, uri)
						} catch(e) {
							console.log(e)
						}

						let postMenu = sel("#postMenu:not([hidden])")
						if(postMenu) postMenu.setAttribute("hidden", 1)

						initInterface(1)

						// Скролл к указанному хэшу либо по-умолчанию вверх
						if (!noScrolling) {
							sel(`a[name="${uri.includes("#") ? uri.split("#")[1] : "top"}"]`).scrollIntoView({behavior: storage.get("settings.animationLength") > 0 ? "smooth" : "instant"})
						}
					})
			}

			throw response.status
		})
		.catch(err => {
			console.log(err)
			
			if (!silent) {
				ntf = notifications.add({
					text: "Не удалось загрузить страницу.<br>" + JSON.stringify(err),
					class: "error",
					timeout: 10000
				})
			}
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
try {
	history.replaceState(window.location.pathname, null, null)
	window.addEventListener("popstate", e => asyncLoadPage(e.state, 0, 1))
} catch(e) {
	console.log(e)	
}