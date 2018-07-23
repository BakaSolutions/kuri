function initInterface() {
	// Инициализация скрытых постов
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

	// Инициализация плавающей формы постинга
	if(DEVICE == "desktop"){
		let postingFormTrigger = sel("#replyFormShow")

		function initPostingForm() {
			if (screen.width > 414) {
				new Draggabilly("#replyForm", {
					containment:	"#replyForm .container",
					handle: 		"#replyForm .widgetHandle"
				})

				postingFormTrigger.removeEventListener("change", initPostingForm)
			}
		}

		postingFormTrigger.addEventListener("change", initPostingForm)
	}
}

function toggleHidePost(data, initial) {
	let target = sel(`#post${data.postNumber}`)
	if (!target) return
	if (data.opPost) target = target.parentNode

	if (initial) {
		target.classList.add("hidden")
	} else{
		let array = JSON.parse(localStorage.getItem("hiddenPosts") || "{}")

		if (target.classList.contains("hidden")){
			array[data.board][data.opPost ? "threads" : "posts"].splice(array[data.board][data.thread ? "threads" : "posts"].indexOf(data.postNumber), 1)
		} else{
			if (!array[data.board]) array[data.board] = {"threads": [], "posts": []}
			array[data.board][data.opPost ? "threads" : "posts"].push(data.postNumber)
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

/* Оверлей с картинкой */
// TODO: Получать разрешение из БД и отрефакторить
function showImage(e) {
	if (!e.ctrlKey && window.innerWidth > 414) {
		e.preventDefault();

		let ntf = notifications.add({
			text: "Загрузка...",
			class: "notification",
			closable: false
		})

		let widget = sel('#imageViewer .widgetBox'),
			img = new Image()

		img.onload = () => {
			let minSize = window.innerHeight / 5,
				maxWidth = window.innerWidth * 0.8,
				maxHeight = window.innerHeight * 0.8,
				widthRatio = img.naturalWidth / maxWidth,
				heightRatio = img.naturalHeight / maxHeight

			if (widthRatio > 1 && widthRatio > heightRatio){
				img.style.width = maxWidth + "px"
				img.style.height = img.naturalHeight / widthRatio + "px"
			} else if (heightRatio > 1 && heightRatio > widthRatio){
				img.style.height = maxHeight + "px"
				img.style.width = img.naturalWidth / heightRatio + "px"
			} else{
				img.style.width = img.naturalWidth + "px"
				img.style.height = img.naturalHeight + "px"
			}

			widget.innerHTML = '';

			sel('.widget#imageViewer .widgetBox').style.left = '0';
			sel('.widget#imageViewer .widgetBox').style.top = '0';
			widget.appendChild(img);

			sel('.widget#imageViewer .mediaInfo').innerText = e.target.dataset.title

			new Draggabilly('.widget#imageViewer .widgetBox');
			toggleWidget("imageViewer")

			notifications.remove(ntf)
		}

		img.onerror = (err) => {
			notifications.remove(ntf)

			ntf = notifications.add({
				text: "Не удалось загрузить изображение.<br>" + JSON.stringify(err),
				class: "error",
				timeout: 10000
			})
		}

		img.src = e.target.href;
	}
}

function zoomImage(img, multiplier){ // TODO: Toже подлежит рефакторингу после добавления разрешений изображений в БД
	let maxSize = window.innerWidth * 3,
		minSize = window.innerHeight / 10

	let newHeight = multiplier * parseInt(img.style.height),
		newWidth  = multiplier * parseInt(img.style.width)

	if (newHeight < maxSize && newWidth < maxSize && newHeight > minSize && newWidth > minSize) {
		img.style.height = newHeight + "px"
		img.style.width  = newWidth  + "px"
	} else{
		console.error("Trying to set width to", newWidth, "and height to", newHeight, "when minimum limit is", minSize, "and maximum limit is", maxSize)
	}
}

function openPostMenu(event, board, postNumber, opPost) {
	let postMenu = sel("#postMenu"),
		rect = event.target.getBoundingClientRect()

	if (postMenu.hasAttribute("hidden")) {
		postMenu.removeAttribute("hidden") 		// Показать меню, если оно скрыто
	} else if (parseInt(postMenu.style.top) == Math.round(rect.bottom + window.scrollY - 10)){
		postMenu.setAttribute("hidden", "1") 	// Скрыть меню, если не скрыто и клик прошел по той же кнопке,
												// которая его открыла
	}

	// Перемещение меню к нужному месту
	postMenu.style.left = rect.right + "px"
	postMenu.style.top 	= rect.bottom + window.scrollY - 10  + "px"

	postMenu.dataset.board = board
	postMenu.dataset.postNumber = postNumber
	postMenu.dataset.opPost = opPost || 0
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
	let newTab = sel(`#preferences [data-tab="${name}"]`),
		oldTab = sel("#preferences [data-tab]:not([hidden])"),
		tabsList = sel("#preferences .tabs")

	if (newTab.hasAttribute("hidden")) {
		oldTab.setAttribute("hidden", "1")
		newTab.removeAttribute("hidden")

		tabsList.querySelector(".active").classList.remove("active")
		tabsList.querySelector(`[onclick="switchToTab('${name}')"]`).classList.add("active")
	}
}

function addToFavourites() {
	// TODO:
}

function toggleWidget(widget) {
	let element = widget instanceof HTMLElement ? widget : sel(`.widget#${widget}`)

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
