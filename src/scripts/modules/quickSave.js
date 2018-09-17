const quickSave = {
	addLink: target => {
		for (info of target.querySelectorAll(".info")) {
			let downloadButton = createElement("a", {
				className: "material-icons dlLink",
				onclick: quickSave.load,
				innerText: "save_alt"
			})

			info.appendChild(downloadButton)
		}
	},

	load: event => {
		let a = event.target.parentNode.parentNode.querySelector("a"),
			uri = a.href,
			name = a.dataset.name
		
		fetch(uri)
			.then(response => {
				if (response.status == 200) {
					return response.blob()
						.then(data => {
							let link = createElement("a", {
								href: window.URL.createObjectURL(data),
								download: name,
								hidden: 1
							})

							document.body.appendChild(link) // Фаерфокс не реагирует на .click(), 
							link.click()					// если ссылки нет в DOMе
							document.body.removeChild(link)
						})
				}

				throw response.status
			})
			.catch(err => {
				console.log(err)
				
				ntf = notifications.add({
					text: "Не удалось загрузить файл.<br>" + JSON.stringify(err),
					class: "error",
					timeout: 10000
				})
			})
	}
}

document.addEventListener("mouseover", event => {
	try{
		let target = event.target.parentNode.parentNode
		if (target.className != "thumbnails") target = target.parentNode

		if(target.className == "thumbnails" && !sel(".dlLink", target)) quickSave.addLink(target)
	} catch(error){
		//
	}
})