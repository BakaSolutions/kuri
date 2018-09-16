const floatingPosts = {
	show: (link) => {
		let uri = link.href.split("#"),
			selector = `.post[data-number="${uri[1]}"]`

		if (sel(selector)){
			let post = sel(selector).cloneNode(true)
			link.appendChild(post)
		} else{
			fetch(uri[0])
				.then(response => {
					if (response.status == 200) {
						return response.text()
							.then(data => {
								let doc = (new DOMParser()).parseFromString(data, "text/html"),
									post = sel(selector, doc).cloneNode(true)

								link.appendChild(post)
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
}