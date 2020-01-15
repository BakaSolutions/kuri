const quickSave = {
	addLink: (target) => {
		let meta = target.parentNode.querySelector(".imageMeta")
		if (meta.querySelector(".icon") === null) {
			let button = createElement("img", {
				className: "icon",
				src: "/static/icons/material-design/ic_save_alt_24px.svg",
				onclick: quickSave.load
			})

			meta.appendChild(button)
		}
	},

	load: (event) => {
		stopRightThereCriminalScum(event)

		let a = event.target.parentNode.parentNode,
			name = `tumba.ch_${a.dataset.name}`,
			uri = a.href

		fetch(uri)
			.then((response) => {
				if (response.status == 200) {
					return response.blob()
						.then((data) => {
							let link = createElement("a", {
								href: window.URL.createObjectURL(data),
								download: name,
								hidden: 1
							})

							// Firefox doesn't react click event if link is not in DOM
							document.body.appendChild(link)
							link.click()
							document.body.removeChild(link)
						})
				} else {
					throw response.status
				}
			})
			.catch((error) => {
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
	if (["thumbnail", "missingThumbnail", "imageMeta"].includes(event.target.className)){
		quickSave.addLink(event.target)
	}
})