const replyForm = {
	init: function(update) {
		this.wrapper = sel("#replyFormWrapper")
		this.form = sel("#replyForm", this.wrapper)
		this.options = {}

		for (option of ["boardName", "redirect", "threadNumber"]) {
			let field = sel(`[name=${option}]`, this.form)
			this.options[option] = field.value
		}

		let submitButton = sel("#submit", this.form)
		submitButton.type = "button"
		submitButton.onclick = this.submitPost

		this.fileInputs = {
			wrapper: sel("#fileInputs", this.form),
			limit: sel("#fileInputs", this.form).dataset.filelimit,
			lastID: -1, // Can be greater than limit and count if files were removed
			count: 0 // Total number of currently displayed tiles
		}

		this.fileInputs.wrapper.style.display = "flex"
		this.resetForm()

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

			// Drag-and-Drop File Uploader
			document.body.addEventListener("dragenter", stopRightThereCriminalScum, false)
			document.body.addEventListener("dragover", stopRightThereCriminalScum, false)
			document.body.addEventListener("dragleave", stopRightThereCriminalScum, false)
			document.body.addEventListener("drop", this.handleDrop, false)

			this.captcha.init()
		}

		this.toggleFloating(update ? this.state : false)
	},

	handleDrop: function(event) {
		stopRightThereCriminalScum(event)
		
		let file = event.dataTransfer.files[0]
		let tile = sel(`[for="file-${replyForm.fileInputs.lastID}"`)

		if (!tile.hasAttribute("title")){ // Check if there are free slots
			replyForm.renderThumbnail(file, tile)

			if (replyForm.pastedFiles === undefined) {
				replyForm.pastedFiles = []
			}

			replyForm.pastedFiles[replyForm.fileInputs.lastID] = file
			
			replyForm.addFInput()
		}
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
				className: "fancyFileInput btn"
			})

			let icon = createElement("img", {
				className: "icon",
				src: "/static/icons/material-design/ic_attach_file_24px.svg"
			})

			button.appendChild(icon)

			input.onchange = this.handleFile

			this.fileInputs.wrapper.appendChild(nsfwCheckbox)
			this.fileInputs.wrapper.appendChild(input)
			this.fileInputs.wrapper.appendChild(button)
		}
	},

	removeFInput: function(ID) {
		sel(`#fileInputs #file-${ID}`).remove()
		sel(`#fileInputs #nsfwFile-${ID}`).remove()
		sel(`#fileInputs label[for="file-${ID}"]`).remove()
		--this.fileInputs.count

		if (!sel(".fancyFileInput:not([title])")){
			this.addFInput()
		}
	},

	fInputCrossClickHandler: function(event) {
		event.preventDefault()
		
		replyForm.removeFInput(this.parentNode.htmlFor.match(/[0-9]+/)[0])
	},

	setFInputLimit: function(limit) {
		if (limit === this.fileInputs.limit) return

		this.fileInputs.limit = limit	

		while (this.fileInputs.count > limit) {
			let inputs = this.fileInputs.wrapper.querySelectorAll("input[type=\"file\"]"),
				lastID = inputs[inputs.length - 1].id.split("-")[1]
			
			this.removeFInput(lastID)
		}

		if (!sel(".fancyFileInput:not([title])")){
			this.addFInput()
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
		
		target.classList.add("hasFile")

		let deleteButton = createElement("div", {
			className: "del btn",
			title: "Удалить"
		}), nsfwButton = createElement("div", {
			className: "nsfw btn",
			title: "Спойлер"
		})

		let deleteIcon = createElement("img", {
			className: "icon",
			src: "/static/icons/material-design/ic_delete_24px.svg"
		}), nsfwIcon = createElement("img", {
			className: "icon",
			src: "/static/icons/material-design/ic_visibility_24px.svg"
		})

		deleteButton.onclick = this.fInputCrossClickHandler
		nsfwButton.onclick = this.toggleNSFW
		deleteButton.appendChild(deleteIcon)
		nsfwButton.appendChild(nsfwIcon)
		target.appendChild(deleteButton)
		target.appendChild(nsfwButton)
	},

	toggleNSFW: function(event) {
		event.preventDefault()

		let checkbox = sel(`#fileInputs #nsfwFile-${this.parentNode.htmlFor.match(/[0-9]+/)[0]}`)

		checkbox.click()
		sel("img", this).src = `/static/icons/material-design/ic_visibility${checkbox.checked ? "_off" : ""}_24px.svg`
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
				let cb = sel(`[name=${option}]`, rF.form).checked
				if (cb) data.append(option, cb)
			}

			data.append("password", storage.get("settings.password"))

			let fileEnum = 0
			for (slot of document.querySelectorAll(".fancyFileInput[title]", rF.fileInputs.wrapper)) {
				let inputFile = sel(`#${slot.htmlFor}`, rF.fileInputs.wrapper).files[0]
				data.append(`file[${fileEnum++}]`, inputFile ? inputFile : rF.pastedFiles[slot.htmlFor.match(/[0-9]+/)[0]])

				let ID = slot.htmlFor.match(/[0-9]+/)[0]
				let cb = sel(`#nsfwFile-${ID}`, rF.form).checked
				if (cb) data.append(`nsfwFile[${ID}]`, cb)
			}

			let xhr = new XMLHttpRequest(),
				ntf = 0
			
			xhr.open("POST", replyForm.form.action)
			
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
					let { message, boardName, threadNumber, number } = xhr.response
					
					rF.resetForm()
					asyncLoadPage(`/${boardName}/res/${threadNumber}.html#${number}`)
					marker.toggleMark(boardName, threadNumber, number.toString(), "own")

					notifications.add({
						text: message,
						timeout: 10000,
						class: "notification"
					})
				} else{
					let { response: {message, error}, status } = xhr
					let errorText = error || status
					if (message instanceof Object) {
						let errors = [];
						for (let key of Object.keys(message)) {
							errors.push("&mdash; " + message[key])
						}
						errorText += ":<br/>" + errors.join("<br/>")
					}
					notifications.add({
						text: `Ошибка постинга:<br/>${errorText}`,
						timeout: 10000,
						class: "error"
					})
				}
			}

			xhr.responseType = 'json'
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
			xhr.withCredentials = true
			xhr.send(data)
		} else{
			replyForm.captcha.update()
			toggleWidget("captcha")
		}
	},

	resetForm: function() {
		this.form.reset()

		while (this.fileInputs.wrapper.firstChild) {
			this.fileInputs.wrapper.firstChild.remove()
		}

		this.fileInputs.count = 0

		this.addFInput()
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

		if (location.pathname.split("/")[2] != "res"){ // On thread page, compensation not needed
			window.scrollBy(0, document.body.clientHeight - height)
		}
	},

	quickReply: function(element) {
		let link = element.parentNode.querySelector(".refLink").href,
			textarea = sel("textarea", this.form),
			mention = `>>${element.parentNode.parentNode.dataset.number}\n`

		this.options.threadNumber = element.parentNode.parentNode.dataset.thread
		this.wrapper.querySelector(".widgetHandle > span").innerHTML = `Ответ в тред <span class="pseudoLink">#${this.options.threadNumber}</span>`
		sel("input[name='subject']", this.wrapper).placeholder = "Имя"

		if (window.pageYOffset){
			this.toggleFloating(true)
		}

		if (storage.get("settings.quickReply.addSelection")) {
			let selection;
			if (selection = getSelection().toString()) {
				mention += `> ${selection}\n`
			}
		}

		if (storage.get("settings.quickReply.insertAtCursor")) {
			this.insertAtCursor(textarea, mention)
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
	init: function() {
		this.input = sel("#captcha input[type=text]")
		this.input.onkeypress = event => {
			if (!/[0-9]/.test(event.key)) stopRightThereCriminalScum(event)
			if (event.key == "Enter") replyForm.captcha.send()
		}

		sel("#captcha input[type=button]").onclick = event => {
			replyForm.captcha.send()
		}
	},

	update: function() {
		sel("#captcha img").src = FOXTAN_URL_BASE + "api/v1/captcha.image" + "?" + +new Date()
		setTimeout(() => {this.input.focus()}, 100)
	},

	check: async function() {
		let uri = FOXTAN_URL_BASE + "api/v1/captcha.check",
			options = {
				credentials: "include",
				method: "post",
				body: new FormData()
			}

		options.body.append("code", this.input.value)

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

	send: async function() {
		if (this.input.value.length <= 4) return

		let c = await this.check()
		this.input.value = ""

		if (!c){
			this.update()
			return
		} else if (c.passed) {
			toggleWidget("captcha")
			replyForm.submitPost()
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