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
		xhr = new XMLHttpRequest(),
		ntf = 0
	
	xhr.open("POST", form.action)
	
	xhr.onloadstart = (e) => {
		ntf = notifications.add({
			text: `Загрузка файла(ов): 0%`,
			class: 'notification',
			closeable: false
		})
	}

	xhr.upload.onprogress = (e) => {
		if (e.lengthComputable) {
			notifications.update(ntf, `Загрузка файла(ов): ${(e.loaded / e.total * 100).toFixed(2)}%`)
		}
	}
	
	xhr.onload = (e) => {
		notifications.remove(ntf)

		if (xhr.status == 200) {
			let r = JSON.parse(xhr.response)
			
			form.reset()
			asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`)
			marker.addMark(r.boardName, r.number.toString(), "own")

			notifications.add({
				text: r.message,
				timeout: 10000,
				class: 'notification'
			})
		} else{
			notifications.add({
				text: `Ошибка постинга: ${xhr.status}`,
				timeout: 10000,
				class: 'error'
			})
		}
	}

	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
	xhr.withCredentials = true
	xhr.send(new FormData(form))
}

captcha = {
	update: function() {
		sel("#captcha img").src = FOXTAN_URL_BASE + "api/v1/captcha.image" + "?" + +new Date()
		setTimeout(() => {sel("#captcha input").focus()}, 100)
	},

	check: async function() {
		console.log("sending captcha", sel("#captcha input").value)

		let uri = FOXTAN_URL_BASE + "api/v1/captcha.check",
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
					throw response
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
	
		if (e.key == "Enter" && value.length > 4) {
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