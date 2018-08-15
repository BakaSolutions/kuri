const media = {
	init: function() {
		this.widget 	= sel(".widget#mediaViewer")
		this.widgetBox 	= this.widget.querySelector(".widgetBox")
		this.info		= this.widget.querySelector(".mediaInfo")
		this.ntf		= null

		new Draggabilly(this.widgetBox)
	},

	reset: function(title) {
		this.widgetBox.innerHTML  	= ""
		this.widgetBox.style.left 	= 0
		this.widgetBox.style.top  	= 0
		this.info.innerText 		= title
	},

	prepare: function(e, mime, name) {
		if (!e.ctrlKey && DEVICE == "desktop") {
			e.preventDefault()

			this.ntf = notifications.add({
				text: "Загрузка...",
				class: "notification",
				closable: false
			})

			this.reset(name)

			if (mime.split("/")[0] == "video") {
				let video = createElement("video", {
					src: e.target.href,
					type: mime,
					controls: 1
				})

				this.display(video)
			} else{
				let img = new Image()
				img.onload = () => this.display(img)
				img.src = e.target.href
			}
		}
	},

	display: function(element) {
		this.widgetBox.appendChild(element)
		toggleWidget("mediaViewer")
		notifications.remove(this.ntf)
	},

	zoom: function(multiplier){
		let maxSize 		= window.innerWidth * 3,
			minSize 		= window.innerHeight / 10,
			mediaNode		= this.widgetBox.querySelector("*"),
			computedStyle 	= window.getComputedStyle(mediaNode, null),
			newHeight 		= multiplier * parseInt(computedStyle.getPropertyValue("height")),
			newWidth  		= multiplier * parseInt(computedStyle.getPropertyValue("width"))

		if (newHeight < maxSize && newWidth < maxSize && newHeight > minSize && newWidth > minSize) {
			mediaNode.style.maxHeight 	= "none"
			mediaNode.style.maxWidth 	= "none"
			mediaNode.style.height 		= newHeight + "px"
			mediaNode.style.width 		= newWidth  + "px"
		} else{
			console.error("Trying to set media width to", newWidth, "and height to", newHeight, "when minimum limit is", minSize, "and maximum limit is", maxSize)
		}
	},

	hide: function(){
		this.reset()
		toggleWidget("mediaViewer")
	}
}

function quickReply(postNumber, threadNumber) {
	let cb = sel("#replyFormShow")
	if(!cb.checked) cb.click()

	let header = `Ответ в тред <span class="pseudoLink">#${threadNumber}</span><span class="material-icons" onclick="undoQuickReply()">close</span>`
	updatePostForm(header, "Имя", threadNumber, `>>${postNumber}\n`)
}

function undoQuickReply(){
	updatePostForm(`Создание треда в <span class="pseudoLink">/${sel("#postForm [name='boardName']").value}/</span>`, "Тема")
}

function updatePostForm(header, subjectPlaceholder, threadNumber, addText){
	let postForm = sel("#replyForm")

	postForm.querySelector(".widgetHandle").innerHTML = header
	postForm.querySelector("[name='subject']").placeholder = subjectPlaceholder
	postForm.querySelector("input#threadNumber").value = threadNumber
	postForm.querySelector("textarea").value += addText || ""

	postForm.querySelector("textarea").focus()
}

function activatePostRemovalWidget(noCheck){
	let widget = sel("#deletePosts")

	setTimeout(() => {
		if (noCheck || !sel("[form='deletePosts']:checked")){
			document.documentElement.style.setProperty("--deletionIconsDisplay", "none")
			widget.setAttribute("hidden", 1)
		} else {
			widget.removeAttribute("hidden")
		}
	}, 1)
}

function deselectAllPosts() {
	let checkboxes = document.querySelectorAll("[form='deletePosts']:checked")
	for (checkbox of checkboxes) checkbox.checked = false

	activatePostRemovalWidget(1)
}

function openPostMenu(event, board, postNumber, opPost) {
	let postMenu = sel("#postMenu"),
		rect = event.target.getBoundingClientRect()

	if (!postMenu.hasAttribute("hidden") && postNumber == postMenu.dataset.postNumber && board == postMenu.dataset.board) {
		postMenu.setAttribute("hidden", 1)
	} else{
		postMenu.style.left = rect.right - 20 + "px"
		postMenu.style.top 	= rect.bottom + window.scrollY - 10  + "px"

		postMenu.dataset.board = board
		postMenu.dataset.postNumber = postNumber
		postMenu.dataset.opPost = opPost || 0

		postMenu.removeAttribute("hidden")
	}
}

function handlePostMenuClick(event) {
	let menu = event.target
	if (menu.dataset.action) menu = menu.parentNode
	
	let data = menu.dataset
	toggleWidget(menu)

	switch (event.target.dataset.action) {
		case "delete":
			document.documentElement.style.setProperty("--deletionIconsDisplay", "inline-block")
			sel(`[for="delete-${data.board}:${data.postNumber}"]`).click()
			break
		case "hide":
			marker.toggleMark(data.board, data.postNumber, "hidden")
			break
		case "edit":
			// TODO:
			break
		case "ban":
			// TODO:
			break
	}
}

function addToFavourites() {
	// TODO:
}

function toggleWidget(widget, init) {
	let element = widget instanceof HTMLElement ? widget : sel(`.widget#${widget}`)
	if (init && !INITIALIZED_SCRIPTS.includes(widget)) init()

	if (element.hasAttribute("hidden")){
		if(DEVICE == "mobile"){
			let postFormCheckbox = sel("#replyFormShow")
			if (postFormCheckbox.checked) postFormCheckbox.click()
		}

		element.removeAttribute("hidden")
	} else{
		element.setAttribute("hidden", 1)
	}
}

function handleOpenPostForm() {
	let button = sel("#replyFormButton")
	
	if (sel("#replyFormShow").checked){
		button.classList.add("active")
	} else{
		button.classList.remove("active")
	}
}

function initInterface(update) {
	document.documentElement.style.setProperty("--animationDuration", `${storage.get("settings.ANIDUR")}s`)

	if (!sel(".noThreads")){
		marker.init()
		time.recalculate()
	}

	fancyFileInputs.init()

	handleOpenPostForm()
	sel("#replyFormShow").onclick = handleOpenPostForm

	if (DEVICE == "mobile"){
		sel("a[name=top]").scrollIntoView()
	} else if(!update && DEVICE == "desktop"){
		media.init()

		let postingFormTrigger = sel("#replyFormShow")

		function initPostingForm() {
			new Draggabilly("#replyForm", {
				containment: 	"#replyForm .container",
				handle: 		"#replyForm .widgetHandle"
			})

			postingFormTrigger.removeEventListener("change", initPostingForm)
		}

		postingFormTrigger.addEventListener("change", initPostingForm)

		// Только на время беты
		setTimeout(() => {
			notifications.add({
				text: `Тестер! Не пропускай последние новости,<br>проверь нашу <a href="${this.location.origin}/static/changelog.htm">страницу с чейнджлогом</a>`,
				class: "notification",
				timeout: 30000
			})
		}, 10000)
	}
}

initInterface()