const quickSave = {
	addLink: (target) => {
		let info = sel("div:last-child", target)

		if(!sel(".dlLink", info)){
			let downloadButton = createElement("a", {
				className: "material-icons dlLink",
				onclick: quickSave.load,
				innerText: "save_alt"
			})

			info.appendChild(downloadButton)
		}
	},

	load: (event) => {
		event.preventDefault()

		let a = event.target.parentNode.parentNode,
			name = a.dataset.name,
			uri = a.href
		
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

document.addEventListener("mouseover", (event) => {
	try{
		let target = event.target.parentNode
		if (target.parentNode.className == "thumbnails") quickSave.addLink(target)
	} catch(error){
		// ...
	}
})