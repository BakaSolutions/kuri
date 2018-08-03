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

	prepare: function(e, mime) {
		if (!e.ctrlKey && DEVICE == "desktop") {
			e.preventDefault()

			this.ntf = notifications.add({
				text: "Загрузка...",
				class: "notification",
				closable: false
			})

			this.reset(e.target.dataset.title)

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

function initHiddenPosts() {
	let object = JSON.parse(localStorage.getItem("hiddenPosts") || "{}"),
		board = window.location.pathname.split("/")[1]

	if (object.hasOwnProperty(board)){
		for (postNumber of object[board].threads) {
			toggleHidePost({board, postNumber, "opPost": 1}, 1)
		}

		for (postNumber of object[board].posts) {
			toggleHidePost({board, postNumber, "opPost": 0}, 1)
		}
	}
}

function toggleHidePost(data, initial) {
	let target = sel(`#post${data.postNumber}`)
	if (!target) return
	if (data.opPost == 1) target = target.parentNode

	if (initial) {
		target.classList.add("hidden")
	} else{
		let array = JSON.parse(localStorage.getItem("hiddenPosts") || "{}")

		if (target.classList.contains("hidden")){
			array[data.board][data.opPost == 1 ? "threads" : "posts"].splice(array[data.board][data.opPost == 1 ? "threads" : "posts"].indexOf(data.postNumber), 1)
		} else{
			if (!array[data.board]) array[data.board] = {"threads": [], "posts": []}
			array[data.board][data.opPost == 1 ? "threads" : "posts"].push(data.postNumber)
		}

		target.classList.toggle("hidden")
		localStorage.setItem("hiddenPosts", JSON.stringify(array))
	}
}

function quickReply(postNumber, threadNumber) {
	let cb = sel("#replyFormShow")
	if(!cb.checked) cb.click()

	let header = `Ответ в тред <span class="pseudoLink">#${threadNumber}</span><span class="material-icons" onclick="undoQuickReply()">close</span>`
	updatePostForm(header, "Имя", threadNumber, `>>${postNumber}\n`)
}

function undoQuickReply(){
	updatePostForm(`Создание треда в <span class="pseudoLink">/${sel("#postForm [name='boardName']").value}/</span>`, "Тема", "")
}

function updatePostForm(header, subjectPlaceholder, threadNumber, addText){
	let postForm = sel("#replyForm")

	postForm.querySelector(".widgetHandle").innerHTML = header
	postForm.querySelector("[name='subject']").placeholder = subjectPlaceholder
	postForm.querySelector("input#threadNumber").value = threadNumber
	if (!addText) return
	postForm.querySelector("textarea").innerHTML += addText
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
		postMenu.setAttribute("hidden", "1")
	} else{
		postMenu.style.left = rect.right + "px"
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

	toggleWidget(menu)

	switch (event.target.dataset.action) {
		case "delete":
			handlePostDeletion(menu.dataset)
			break
		case "hide":
			toggleHidePost(menu.dataset)
			break
		case "edit":
			handlePostEdition(menu.dataset)
			break
		case "ban":
			handleUserBan(menu.dataset)
			break
	}
}

function handlePostDeletion(data) {
	document.documentElement.style.setProperty("--deletionIconsDisplay", "inline-block")
	sel(`[for="delete-${data.board}:${data.postNumber}"]`).click()
}

function handlePostEdition(data) {
	// TODO:
}

function handleUserBan(data) {
	// TODO:
}

function switchToTab(name) { // Переключение табов в виджете настроек
	let newTab = sel(`#settings [data-tab="${name}"]`),
		oldTab = sel("#settings [data-tab]:not([hidden])"),
		tabsList = sel("#settings .tabs")

	if (newTab.hasAttribute("hidden")) {
		oldTab.setAttribute("hidden", 1)
		newTab.removeAttribute("hidden")

		tabsList.querySelector(".active").classList.remove("active")
		tabsList.querySelector(`[onclick="switchToTab('${name}')"]`).classList.add("active")
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

function initInterface(update) {
	initHiddenPosts()
	fancyFileInputs.init()
	
	// Инициализация плавающей формы постинга
	if(!update && DEVICE == "desktop"){
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
		notifications.add({
			text: `Тестер! Не пропускай последние новости,<br>проверь нашу <a href="${this.location.origin}/static/changelog.htm">страницу с чейнджлогом</a>`,
			class: "notification",
			timeout: 60000
		})
	}
}

initInterface()