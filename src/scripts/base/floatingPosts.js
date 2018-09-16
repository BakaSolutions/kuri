document.onmouseover = (e) => {
	let loadedModules = storage.get(`settings.modules`)

	if (e.target.className == "postLink" && !e.target.querySelector(".post")){
		let link = e.target.href.split("#"),
			selector = `.post[data-number="${link[1]}"]`

		if (document.querySelector(selector)){
			let post = document.querySelector(selector).cloneNode(true)
			e.target.appendChild(post)
		} else{	

			fetch(link[0])
				.then(response => {
					if (response.status == 200) {
						return response.text()
							.then(data => {
								let doc = (new DOMParser()).parseFromString(data, "text/html"),
									post = doc.querySelector(selector).cloneNode(true)

								e.target.appendChild(post)
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
	} else if(loadedModules.includes("quickSave")){
		try{
			let target = e.target.parentNode.parentNode
			if (target.className != "thumbnails") target = target.parentNode

			if(target.className == "thumbnails" && !target.querySelector(".dlLink")) quickSave.addLink(target)
		} catch(error){
			//
		}
	}
}