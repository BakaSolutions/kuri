function sendPost(e){ // TODO: Проверка валидности всех полей
	e.preventDefault()

	let form = sel("#postForm"),
		uri = form.action,
		formData = new FormData(form),
		options = {
			credentials: "include",
			method: "post",
			headers: {
				"X-Requested-With": "XMLHttpRequest"
			},
			body: formData
		}

	fetch(uri, options)
		.then(response => {
			if (response.status == 200) {
				response.json().then(r => {
					asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`)

					notifications.add({
						text: r.message,
						timeout: 10000,
						class: 'notification'
					})
				})
			} else {
				throw response.status
			}
		})
		.catch(err => {
			notifications.add({
				text: err,
				timeout: 10000,
				class: 'notification'
			})
		})
}
