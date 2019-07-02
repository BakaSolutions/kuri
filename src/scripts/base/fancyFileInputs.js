const fancyFileInputs = {
	init: function() {
		this.wrapper = sel("#fileInputs")
		if (!this.wrapper) return false
		this.fileLimit = this.wrapper.dataset.filelimit // Maximum file count

		this.wrapper.style.display = "flex"
		this.wrapper.innerHTML = ""
		this.lastInputId = -1 // Can be greater than fileLimit and inputCount if files were removed
		this.inputCount = 0 // Total number of displayed tiles
		this.addInput()
		return true
	},

	pasteFile: async function(file){
		let input = sel(`#f${this.lastInputId}`)
		let tile = sel(`[for="f${this.lastInputId}"]`)

		if (!tile.classList.contains("hasFile")){
			input.dataset.base64 = await fancyFileInputs.renderPreview(file, tile)
		}
	},

	addInput: function(){
		if (this.inputCount < this.fileLimit){
			this.lastInputId++
			this.inputCount++
			
			let input = createElement("input", {
				type: "file",
				name: `file[${this.lastInputId}]`,
				id: `f${this.lastInputId}`,
				hidden: 1
			})

			let nsfwCheckbox = createElement("input", {
				type: "checkbox",
				name: `nsfwFile[${this.lastInputId}]`,
				id: `f${this.lastInputId}NSFW`,
				hidden: 1
			})

			let button = createElement("label", {
				htmlFor: `f${this.lastInputId}`,
				className: "fancyFileInput material-icons btn"
			})

			input.onchange = this.handleFiles

			this.wrapper.appendChild(nsfwCheckbox)
			this.wrapper.appendChild(input)
			this.wrapper.appendChild(button)
		}
	},

	handleFiles: function(event){
		let file = event.target.files[0]
		fancyFileInputs.renderPreview(file, sel(`[for=${event.target.id}]`))

		fancyFileInputs.addInput()
	},

	renderPreview: function(file, target) {
		return new Promise((resolve, reject) => {
			target.title = file.name
			
			let base64 = ""

			if (file.type.match("image.*")) {
				let reader = new FileReader()

				reader.onload = ((file) => {
					return (event) => {
						base64 = event.target.result
						target.style.backgroundImage = `url(${base64})`
						target.classList.add("hasFile")

						resolve(base64)
					}
				})(file)

				reader.readAsDataURL(file)
			} else{
				target.innerText = file.name.split(".").pop()
				target.style.backgroundImage = ""
				target.classList.add("hasFile")

				reject()
			}
			
			if (target.classList.contains("material-icons")) target.classList.remove("material-icons")

			let deleteButton = createElement("div", {
				className: "del material-icons",
				innerText: "close"
			}), nsfwButton = createElement("div", {
				className: "nsfw material-icons",
				innerText: "visibility"
			})

			deleteButton.onclick = this.removeInput
			nsfwButton.onclick = this.toggleNSFW
			target.appendChild(deleteButton)
			target.appendChild(nsfwButton)
		})
	},

	removeInput: function(event) {
		event.preventDefault()

		let id = event.target.parentNode.htmlFor
		
		sel(`#fileInputs #${id}`).remove()
		sel(`#fileInputs #${id}NSFW`).remove()
		event.target.parentNode.remove()
		fancyFileInputs.inputCount--

		if (!sel(".fancyFileInput:not(.hasFile)")){
			fancyFileInputs.addInput()
		}
	},

	toggleNSFW: function(event) {
		event.preventDefault()
		let target = event.target,
			checkbox = sel(`#fileInputs #${target.parentNode.htmlFor}NSFW`)
		
		checkbox.click()
		target.innerText = `visibility${checkbox.checked ? '_off' : ''}`
	}
}