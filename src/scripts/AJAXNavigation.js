function asyncLoadPage(uri, noScrolling = 0) {
	let ntf = notifications.add({
		text: "Загрузка...",
		class: 'notification'
	})

	let xhr = new XMLHttpRequest()

	xhr.onload = () => {
		let doc = (new DOMParser()).parseFromString(xhr.response, "text/html")

		let main = doc.querySelector("main")
		if (main) sel("main").innerHTML = main.innerHTML
		else return location.href = uri

		let title = doc.querySelector("title")
		sel("title").innerHTML = title.innerHTML
		history.pushState({uri}, title, uri)

		if (sel("#replyForm") && doc.querySelector("#replyForm")) {
			sel("#replyForm .widgetHandle").innerHTML = doc.querySelector("#replyForm .widgetHandle").innerHTML
			sel("#postForm").innerHTML = doc.querySelector("#postForm").innerHTML
		}

		// Скролл к указанному хэшу либо по-умолчанию вверх
		if (!noScrolling) scrollTo(uri.includes("#") ? uri.split("#")[1] : "top")

		// console.log("Asynchronously navigated to", uri)
		// sel("main").classList.remove("refreshing")
		notifications.remove(ntf)
	};

	xhr.open("GET", uri);
	xhr.send(null);
}

// Бинд кликов
(() => {
	sel('body').onclick = e => {
		if (e.target.hasAttribute('href')){
			let uri = e.target.getAttribute('href').replace(window.location.host, "")

			if(/^(\/|#)/.test(uri) && !e.target.hasAttribute('download')){
				e.preventDefault()

				// Внутренние ссылки
				if (/^\//.test(uri)) asyncLoadPage(uri)

				// Ссылки на якоря
				else if (/^\#/.test(uri)) scrollTo(uri.split('#')[1])
			}
		}
	}
})()
