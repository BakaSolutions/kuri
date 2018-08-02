const fancyFileInputs = {
	inputCount: 0,
	lastInputId: 0,

	init: function() {
		this.wrapper = sel("#fileInputs")
		this.fileLimit = this.wrapper.dataset.filelimit

		this.wrapper.style.display = "flex"
		this.wrapper.innerHTML = ""
		this.addInput()
	},

	addInput: function(){
		if (this.inputCount < this.fileLimit){
			let input = createElement("input", {
				type: "file",
				name: `file[${this.lastInputId}]`,
				id: `f${this.lastInputId}`,
				hidden: 1
			})

			let button = createElement("label", {
				htmlFor: `f${this.lastInputId}`,
				className: "fancyFileInput material-icons"
			})

			this.lastInputId++
			this.inputCount++

			input.onchange = this.handleFiles

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
		if (file.type.match("image.*")) {
			let reader = new FileReader()

			reader.onload = ((file) => {
				return (e) => {
					target.style.backgroundImage = `url(${e.target.result})`
					target.classList.add("hasFile")
				}
			})(file)

			reader.readAsDataURL(file)
		} else{
			target.innerText = file.name.split(".").pop()
			target.style.backgroundImage = ""
			target.classList.add("hasFile")
		}
		
		if (target.classList.contains("material-icons")) target.classList.remove("material-icons")

		let deleteButton = createElement("div", {
			className: "del material-icons",
			innerText: "close"
		})

		deleteButton.onclick = this.removeInput
		target.appendChild(deleteButton)
	},

	removeInput: function(event) {
		event.preventDefault()

		sel(`#fileInputs #${event.target.parentNode.htmlFor}`).remove()
		event.target.parentNode.remove()
		fancyFileInputs.inputCount--

		if (!sel(".fancyFileInput:not(.hasFile)")){
			fancyFileInputs.addInput()
		}
	}
}

fancyFileInputs.init()