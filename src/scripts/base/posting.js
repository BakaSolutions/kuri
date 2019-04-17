function insertAtCursor(field, value) {
	if (field.selectionStart || field.selectionStart === 0) {
		let {selectionStart, selectionEnd} = field
		let cursorPosition = selectionStart + value.length
		field.value = field.value.substring(0, selectionStart)
			+ value
			+ field.value.substring(selectionEnd, field.value.length)

		field.setSelectionRange(cursorPosition, cursorPosition)
		return field.focus()
	}
	return field.value += value
}

function quickReply(element) {
	let link = element.parentNode.querySelector(".refLink").href,
		textarea = sel("#postForm textarea"),
		mention = `>>${element.parentNode.parentNode.dataset.number}\n`

	if (window.pageYOffset){
		replyForm.toggleFloating(true)
	}

	if (storage.get("settings.quickReply.addSelection")) {
		let selection;
		if (selection = getSelection().toString()) {
			mention += '> ' + selection + '\n'
		}
	}

	if (storage.get("settings.quickReply.insertAtCursor")) {
		insertAtCursor(textarea, mention)
	} else {
		textarea.value += mention
	}

	textarea.focus()
}

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

let captcha = {
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

let replyForm = {
	init: function(update){
		if (DEVICE == "desktop") {
			let textarea = document.querySelector("#replyForm textarea")

			this.draggie = new Draggabilly("#replyForm", {
				containment: 	"#replyForm .container",
				handle: 		"#replyForm .widgetHandle"
			})

			this.draggie.on("dragStart", () => this.toggleFloating(true))
			this.draggie.on("dragEnd", () => {
				let element = this.draggie.element
				sessionStorage.setItem("replyFormPos", `${element.style.left} ${element.style.top}`)
			})

			textarea.addEventListener("input", (event) => {
				let field = event.target

				field.style.height = "100%"
				field.style.height = `${field.scrollHeight}px`
			}, false)

			textarea.addEventListener("paste", (event) => {
				let clipboard = (event.originalEvent || event).clipboardData
				
				if (clipboard.items !== undefined && clipboard.items.length > 0) {
					for (let item of clipboard.items) {
						if (item.kind == "file") fancyFileInputs.pasteFile(item.getAsFile())
					}
				}
			}, false)

			try{
				let pos = sessionStorage.getItem("replyFormPos").split(" ")
				this.draggie.element.style.left = pos[0]
				this.draggie.element.style.top = pos[1]
			} catch(err){
				// Позиция не записана
			}
		} else{
			this.draggie = {
				element: document.querySelector("#replyForm")
			}
		}
		
		this.toggleFloating(update ? this.state : false)
	},

	toggleFloating: function(value){
		let height = document.body.clientHeight

		if (value !== undefined) {
			this.state = !value
		} 

		let usefulInfo = document.querySelector("#usefulInfo")

		if (this.state){
			this.draggie.element.style.left = null
			this.draggie.element.style.top = null

			document.querySelector("#postForm").appendChild(usefulInfo)

			this.draggie.element.classList.remove("floating")
		} else{
			document.querySelector("main").insertBefore(usefulInfo, this.draggie.element);

			this.draggie.element.classList.add("floating")
		}

		this.state = !this.state

		window.scrollBy(0, document.body.clientHeight - height)
	}
}