function quickReply(element) {
	let link = element.parentNode.querySelector(".refLink").href
	if (window.location.href.split("#")[0] !== link.split("#")[0]) {
		if (storage.get("settings.quickReply.navigateTo")) {
			asyncLoadPage(link)
		} else {
			storage.set("settings.quickReply.navigateTo", true)
			return quickReply(element) // TODO: Не загружать форму ответа с другой страницы
		}
	}

	let cb = sel("#replyFormShow")
	if(!cb.checked) cb.click()

	let textarea = sel("#postForm textarea")
	let mention = `>>${element.parentNode.parentNode.dataset.number}\n`

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
		textarea.focus()
	}
}

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

function activatePostRemovalWidget(noCheck){
	let widget = sel("#deletePosts")

	setTimeout(() => {
		if (noCheck || !sel("[form='deletePosts']:checked")){
			document.documentElement.style.setProperty("--deletionIconsDisplay", "none")
			widget.setAttribute("hidden", 1)
		} else {
			widget.removeAttribute("hidden")
			sel("#deletePosts [name=password]").value = storage.get("settings.password")
		}
	}, 1)
}

function deselectAllPosts() {
	let checkboxes = document.querySelectorAll("[form='deletePosts']:checked")
	for (let checkbox of checkboxes) checkbox.checked = false

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
		case "pin":
			let body = new FormData();
			body.append(data.board, data.postNumber);

			let options = {
				credentials: "include",
				method: "post",
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				},
				body
			}

			fetch(FOXTAN_URL_BASE + 'api/v1/thread.pin', options)
				.then(response => {
					response.json().then(r => {
						if (!response.ok) {
							throw r.message
						}
						notifications.add({
							text: r.pinned ? "Тред закреплён." : "Тред откреплён.",
							timeout: 10000,
							class: 'notification'
						})
					})
					.catch(err => {
						console.log(err)
						notifications.add({
							text: "Ошибка закрепления:<br>" + (err.message || err),
							timeout: 10000,
							class: 'notification'
						})
					})
				})
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
	if (init && !INITIALIZED_SCRIPTS.includes(widget)){
		INITIALIZED_SCRIPTS.push(widget)	
		init()
	} 

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
	document.body.style.setProperty("--animationDuration", `${storage.get("settings.animationLength")}s`)
	
	if (storage.get("settings.autoUnspoil")){
		document.body.classList.add("noSpoilers")
	}

	if (sel(".noThreads")) return

	marker.init()
	time.recalculate()

	let postingFormTrigger = sel("#replyFormShow")

	if (fancyFileInputs.init()) {
		handleOpenPostForm()
		postingFormTrigger.onclick = handleOpenPostForm
		sel("#postForm [name=password]").value = storage.get("settings.password")
	}


	if (DEVICE == "mobile"){
		sel("a[name=top]").scrollIntoView()
	} else if(!update && DEVICE == "desktop"){
		media.init()

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