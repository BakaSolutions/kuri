const replyForm = {
	init: function(update) {
		this.wrapper = sel("#replyFormWrapper")
		this.form = sel("#replyForm", this.wrapper)
		this.options = {}

		for (option of ["boardName", "redirect", "threadNumber"]) {
			let field = sel(`[name=${option}]`, this.form)
			this.options[option] = field.value
			this.form.removeChild(field)
		}

		this.form.removeChild(sel("[name=password]", this.form))

		let submitButton = sel("#submit", this.form)
		submitButton.type = "button"
		submitButton.onclick = this.submitPost

		this.fileInputs = {
			wrapper: sel("#fileInputs", this.form),
			limit: sel("#fileInputs", this.form).dataset.filelimit,
			lastID: -1, // Can be greater than limit and count if files were removed
			count: 0 // Total number of currently displayed tiles
		}

		while (this.fileInputs.wrapper.firstChild) {
			this.fileInputs.wrapper.firstChild.remove()
		}

		this.fileInputs.wrapper.style.display = "flex"
		this.addFInput()

		if (DEVICE == "desktop") {
			let textarea = document.querySelector("#replyForm textarea")

			this.dragElement = new Draggable(this.wrapper, sel(".widgetHandle", this.wrapper), "boundToViewport")
			this.dragElement.ondragstart = () => {
				this.wrapper.classList.add("isDragged")
				this.toggleFloating(true)
			}
			this.dragElement.ondragend = () => {
				this.wrapper.classList.remove("isDragged")
			}

			textarea.addEventListener("input", (event) => {
				let field = event.target

				field.style.height = "100%"
				field.style.height = `${field.scrollHeight}px`
			}, false)

			sel(`textarea`, this.form).addEventListener("paste", (event) => {
				let clipboard = (event.originalEvent || event).clipboardData
				
				if (clipboard.items !== undefined && clipboard.items.length > 0) {
					for (item of clipboard.items) {
						if (item.kind == "file") {
							replyForm.pasteFile(item.getAsFile())
						}
					}
				}
			}, false)
		}

		this.toggleFloating(update ? this.state : false)
	},

	addFInput: function() {
		if (this.fileInputs.count < this.fileInputs.limit){
			++this.fileInputs.lastID
			++this.fileInputs.count
			
			let input = createElement("input", {
				type: "file",
				id: `file-${this.fileInputs.lastID}`,
				hidden: true
			})

			let nsfwCheckbox = createElement("input", {
				type: "checkbox",
				id: `nsfwFile-${this.fileInputs.lastID}`,
				hidden: true
			})

			let button = createElement("label", {
				htmlFor: `file-${this.fileInputs.lastID}`,
				className: "fancyFileInput material-icons btn"
			})

			input.onchange = this.handleFile

			this.fileInputs.wrapper.appendChild(nsfwCheckbox)
			this.fileInputs.wrapper.appendChild(input)
			this.fileInputs.wrapper.appendChild(button)
		}
	},

	removeFInput: function(event) {
		event.preventDefault()

		let label = this.parentNode
		let ID = label.htmlFor.match(/[0-9]+/)[0]
		
		sel(`#fileInputs #file-${ID}`).remove()
		sel(`#fileInputs #nsfwFile-${ID}`).remove()
		label.remove()
		--replyForm.fileInputs.count

		if (!sel(".fancyFileInput:not([title])")){
			replyForm.addFInput()
		}
	},

	handleFile: function(event) {
		replyForm.renderThumbnail(this.files[0], sel(`[for="${this.id}"]`))
		replyForm.addFInput()
	},

	pasteFile: function(file){
		let tile = sel(`[for="file-${this.fileInputs.lastID}"`)

		if (!tile.hasAttribute("title")){ // Check if there are free slots
			replyForm.renderThumbnail(file, tile)

			if (this.pastedFiles === undefined) {
				this.pastedFiles = []
			}

			this.pastedFiles[this.fileInputs.lastID] = file
			
			replyForm.addFInput()
		}
	},

	renderThumbnail: function(file, target) {
		target.title = file.name

		if (file.type.match("image.*")) {
			let reader = new FileReader()

			reader.onload = ((file) => (event) => {
				target.style.backgroundImage = `url(${event.target.result})`
			})(file)

			reader.readAsDataURL(file)
		} else{
			target.innerText = file.name.split(".").pop()
			target.style.backgroundImage = ""
		}
		
		if (target.classList.contains("material-icons")) {
			target.classList.remove("material-icons")
		}

		let deleteButton = createElement("div", {
			className: "del material-icons",
			innerText: "close",
			title: "Удалить"
		}), nsfwButton = createElement("div", {
			className: "nsfw material-icons",
			innerText: "visibility",
			title: "Спрятать"
		})

		deleteButton.onclick = this.removeFInput
		nsfwButton.onclick = this.toggleNSFW
		target.appendChild(deleteButton)
		target.appendChild(nsfwButton)
	},

	toggleNSFW: function(event) {
		event.preventDefault()

		let checkbox = sel(`#fileInputs #nsfwFile-${this.parentNode.htmlFor.match(/[0-9]+/)[0]}`)

		checkbox.click()
		this.innerText = `visibility${checkbox.checked ? "_off" : ""}`
	},

	submitPost: async function(event) {
		let c = await replyForm.captcha.check()

		if (c && c.trustedPostCount){
			let rF = replyForm,
				data = new FormData()

			for (option of ["boardName", "redirect", "threadNumber"]) {
				data.append(option, rF.options[option])
			}

			for (option of ["subject", "text"]) {
				data.append(option, sel(`[name=${option}]`, rF.form).value)
			}

			for (option of ["sage", "op"]) {
				data.append(option, sel(`[name=${option}]`, rF.form).checked)
			}

			data.append("password", storage.get("settings.password"))

			let fileEnum = 0
			for (slot of document.querySelectorAll(".fancyFileInput[title]", rF.fileInputs.wrapper)) {
				let inputFile = sel(`#${slot.htmlFor}`, rF.fileInputs.wrapper).files[0]
				data.append(`file[${fileEnum++}]`, inputFile ? inputFile : rF.pastedFiles[slot.htmlFor.match(/[0-9]+/)[0]])
			}

			let xhr = new XMLHttpRequest(),
				ntf = 0
			
			xhr.open("POST", this.form.action)
			
			xhr.onloadstart = (event) => {
				ntf = notifications.add({
					text: "Загрузка файла(ов): 0%",
					class: "notification",
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

				if (xhr.status === 200) {
					let r = JSON.parse(xhr.response)
					
					this.form.reset()
					asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`)
					marker.toggleMark(r.boardName, r.threadNumber, r.number.toString(), "own")

					notifications.add({
						text: r.message,
						timeout: 10000,
						class: "notification"
					})
				} else{
					notifications.add({
						text: `Ошибка постинга: ${xhr.status}`,
						timeout: 10000,
						class: "error"
					})
				}
			}

			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
			xhr.withCredentials = true
			xhr.send(data)
		} else{
			replyForm.captcha.update()
			toggleWidget("captcha")
		}
	},

	toggleFloating: function(value) {
		let height = document.body.clientHeight

		if (value !== undefined) {
			this.state = !value
		}

		let usefulInfo = sel("#usefulInfo")

		if (this.state){
			if (DEVICE == "desktop") this.dragElement.reset()

			sel("#replyForm").appendChild(usefulInfo)

			this.wrapper.classList.remove("floating")
		} else{
			sel("main").insertBefore(usefulInfo, this.wrapper);

			this.wrapper.classList.add("floating")
		}

		this.state = !this.state

		window.scrollBy(0, document.body.clientHeight - height)
	},

	quickReply: function(element) {
		let link = element.parentNode.querySelector(".refLink").href,
			textarea = sel("textarea", this.form),
			mention = `>>${element.parentNode.parentNode.dataset.number}\n`

		if (window.pageYOffset){
			replyForm.toggleFloating(true)
		}

		if (storage.get("settings.quickReply.addSelection")) {
			let selection;
			if (selection = getSelection().toString()) {
				mention += `> ${selection}\n`
			}
		}

		if (storage.get("settings.quickReply.insertAtCursor")) {
			insertAtCursor(textarea, mention)
		} else {
			textarea.value += mention
		}

		textarea.focus()
	},

	insertAtCursor: function(field, value) {
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
}

replyForm.captcha = {
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
				submitPost()
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