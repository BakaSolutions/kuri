async function handlePostSend(e) { // TODO: Проверка валидности всех полей
	e.preventDefault()

	let c = await captcha.check()

	if (c && c.trustedPostCount){
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
			response.json().then(r => {
				if (response.status == 200) {
					asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`)

					notifications.add({
						text: r.message,
						timeout: 10000,
						class: 'notification'
					})
				} else{
					throw r.message
				}
			})
			.catch(err => {
				notifications.add({
					text: "Ошибка постинга:<br>" + err,
					timeout: 10000,
					class: 'notification'
				})
			})
		})
}

captcha = {
	update: function() {
		sel("#captcha img").src = "https://tuderi.tumba.ch:48596/api/v1/captcha.image" + "?" + +new Date()
	},

	check: async function() {
		console.log("sending captcha", sel("#captcha input").value)

		let uri = "https://tuderi.tumba.ch:48596/api/v1/captcha.check",
			options = {
				credentials: "include",
				method: "post",
				body: new FormData()
			}

		options.body.append("code", sel("#captcha input").value)

		return fetch(uri, options)
			.then(response => {
				if (response.status == 200) {
					return response.json()
				} else {
					throw response.statusText
				}
			})
			.catch(err => {
				console.log(err)

				notifications.add({
					text: "Не удалось проверить капчу",
					timeout: 10000,
					class: "error"
				})
			})
	},

	send: async function(e) {
		let value = sel("#captcha input").value
		if (!/[0-9]/.test(e.key)) {
			e.preventDefault()
		}
	
		if (e.key == "Enter" && value.length > 3) {
			let c = await this.check()
			sel("#captcha input").value = ""

			if (!c){
				this.update()
				return
			} else if (c.passed) {
				toggleWidget("captcha")
				sendPost()
			} else{
				this.update()
				notifications.add({
					text: "Капча введена неверно",
					timeout: 10000,
					class: "error"
				})
			}
		}
	}
}