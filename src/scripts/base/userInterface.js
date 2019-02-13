let budges = {
	getNews: () => {
		let uri = FOXTAN_URL_BASE + "lastPostNumbers.json"

		fetch(uri).then(response => {
			if (response.status < 400) {
				response.json().then(r => {
					localStorage.setItem("lastPosts", JSON.stringify(r))
				})
			} else {
				throw response.statusText
			}
		}).catch(err => console.error("Fetch error occured:", err))
	},

	setSeen: (boardName) => {
		let seen = localStorage.getItem("seenPosts")
			seen = JSON.parse(seen) || {}

		let last = localStorage.getItem("lastPosts")

		if(last){
			seen[boardName] = JSON.parse(last)[boardName]
			localStorage.setItem("seenPosts", JSON.stringify(seen))
		}
	},

	show: () => {
		let seen = JSON.parse(localStorage.getItem("seenPosts")),
			last = JSON.parse(localStorage.getItem("lastPosts"))
		
		if(seen !== null){
			for(let board in seen){
				let number = last[board] - seen[board],
					link = document.querySelector(`#boards [href="/${board}/"]`)

				if (number){
					link.dataset.badge = `+${number}`
				} else{
					delete link.dataset.badge
				}
			}
		}
	}
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

function initInterface(update) {
	document.body.style.setProperty("--animationDuration", `${storage.get("settings.animationLength")}s`)
	
	if (storage.get("settings.autoUnspoil")){
		document.body.classList.add("noSpoilers")
	}

	replyForm.init(update)

	if (sel(".noThreads")) return

	marker.init()
	time.recalculate()

	if (!storage.get("settings.showMarkupCheatSheet")){
		document.querySelector("#usefulInfo > div:last-child").remove()
	}

	if (fancyFileInputs.init()) {
		sel("#postForm [name=password]").value = storage.get("settings.password")
	}


	if (DEVICE == "mobile"){
		sel("a[name=top]").scrollIntoView()
	} else if(!update && DEVICE == "desktop"){
		media.init()

		// Только на время беты
		setTimeout(() => {
			notifications.add({
				text: `Тестер! Не пропускай последние новости,<br>проверь нашу <a href="${this.location.origin}/static/changelog.htm">страницу с чейнджлогом</a>`,
				class: "notification",
				timeout: 30000
			})
		}, 10000)
	}

	budges.getNews()
	budges.setSeen(window.location.href.split("/")[3])
	budges.show()
}

initInterface()

function showBoardInfo(name, bumpLimit, fileLimit){
	notifications.add({
		text: `${name}<br>Бамплимит: ${bumpLimit}<br>Максимум прикреплений: ${fileLimit}`, 
		class: 'notification', 
		timeout: 10000
	})
}