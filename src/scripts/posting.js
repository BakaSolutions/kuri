async function handlePostSend(e) { // TODO: Проверка валидности всех полей
	e.preventDefault()

	let c = await captcha.check()

	if (c.trustedPostCount){
		sendPost()
	} else{
		captcha.update()
		toggleWidget("captcha")
	}
}

function sendPost() {
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

captcha = {
	update: function() {
		sel("#captcha img").src = "https://tuderi.tumba.ch:48596/api/v1/captcha.image" + "?" + +new Date()
		sel("#captcha input").value = ""
	},

	check: async function() {
		let uri = "https://tuderi.tumba.ch:48596/api/v1/captcha.check",
			options = {
				credentials: "include",
				method: "post",
				body: new FormData(sel("#captcha form"))
			}

		return fetch(uri, options)
			.then(response => {
				if (response.status == 200) {
					return response.json()
				} else {
					throw response.status
				}
			})
			.catch(err => console.error("Fetch error occured:", err))
	},

	send: async function() {
		if (sel("#captcha input").value) {
			let c = await this.check()

			if (c.passed) {
				toggleWidget("captcha")
				sendPost()
			} else{
				this.update()
			}
		}
	}
}
