document.addEventListener("mouseover", (event) => {
	let target = event.target

	if (target.className == "postLink" && !sel(".post", target)){
		let uri = target.href.split("#"),
			selector = `.post[data-number="${uri[1]}"]`

		if (sel(selector)){
			let post = sel(selector).cloneNode(true)
			target.appendChild(post)
		} else{
			fetch(uri[0])
				.then(response => {
					if (response.status == 200) {
						return response.text()
							.then(data => {
								let doc = (new DOMParser()).parseFromString(data, "text/html"),
									post = sel(selector, doc).cloneNode(true)

								target.appendChild(post)
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
	}
})