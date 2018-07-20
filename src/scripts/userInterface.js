(() => { // Функция делает форму ответа плавающей при первом ее показе
	let trigger = sel("#replyFormShow")

	let init = () => {
		if (screen.width > 414) {
			new Draggabilly('#replyForm', {
				containment: '#replyForm .container',
				handle: '#replyForm .widgetHandle'
			})

			trigger.removeEventListener("change", init)
		}
	}

	trigger.addEventListener("change", init)
})()

function spoilPost(button, thread) {
	let target = button.parentNode.parentNode.parentNode.parentNode;
	if (thread) target = target.parentNode;

	target.classList.toggle('spoiled');
}

function quickReply(postNumber, threadNumber) {
	let cb = sel("#replyFormShow")
	if(!cb.checked) cb.click()

	sel("#replyForm .widgetHandle").innerHTML = `Ответ в тред <span class="pseudoLink">#${threadNumber}</span><span class="material-icons" onclick="undoQuickReply()">close</span>`
	sel("#replyForm [name='subject']").placeholder = "Имя"
	sel("#replyForm textarea").innerHTML += `>>${postNumber}\n`
	sel("input#threadNumber").value = threadNumber
}

function undoQuickReply(){
	sel("#replyForm .widgetHandle").innerHTML = `Создание треда в <span class="pseudoLink">/${sel("#postForm [name='boardName']").value}/</span>`
	sel("#replyForm [name='subject']").placeholder = "Тема"
	sel("#replyForm input#threadNumber").value = ""
}

function activatePostRemovalWidget(){
	setTimeout(() => {
		if(sel('[form="deletePosts"]:checked')){
			sel('#deletePosts').removeAttribute('hidden');
		} else{
			document.documentElement.style.setProperty("--deletionIconsDisplay", "none")
			sel('#deletePosts').setAttribute('hidden', '');
		}
	}, 1)
}

function deselectAllPosts() {
	let checkboxes = document.querySelectorAll('[form="deletePosts"]:checked')
	for (checkbox of checkboxes) checkbox.checked = false

	activatePostRemovalWidget()
}

/* Оверлей с картинкой */
function showImage(e) {
	if (!e.ctrlKey && window.innerWidth > 414) {
		e.preventDefault();

		let ntf = notifications.add({
			text: "Загрузка...",
			class: 'notification',
			nonclosable: 1
		})

		let widget = sel('#imageViewer .widgetBox'),
				img = new Image();

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
				img.style.width = img.naturalWidth
				img.style.height = img.naturalHeight
			}

			widget.innerHTML = '';

			sel('.widget#imageViewer .widgetBox').style.left = '0';
			sel('.widget#imageViewer .widgetBox').style.top = '0';
			widget.appendChild(img);

			sel('.widget#imageViewer .mediaInfo').innerText = e.target.dataset.title

			new Draggabilly('.widget#imageViewer .widgetBox');
			sel('.widget#imageViewer').removeAttribute('hidden');

			notifications.remove(ntf)
		}

		img.onerror = (err) => {
			notifications.remove(ntf)

			ntf = notifications.add({
				text: "Не удалось загрузить изображение.<br>" + JSON.stringify(err),
				class: 'notification',
				timeout: 10000
			})
		}

		img.src = e.target.href;
	}
};

function openPostMenu(event, board, postNumber, opPost) {
	let postMenu = sel("#postMenu"),
		rect = event.target.getBoundingClientRect();

	if (postMenu.hasAttribute("hidden")) {
		postMenu.removeAttribute("hidden") 		// Показать меню, если оно скрыто
	} else if (parseInt(postMenu.style.top) == Math.round(rect.bottom + window.scrollY - 20)){
		postMenu.setAttribute("hidden", "1") 	// Скрыть меню, если не скрыто и клик прошел по той же кнопке,
												// которая его открыла
	}

	// Перемещение меню к нужному месту
	postMenu.style.left = rect.right + "px"
	postMenu.style.top = rect.bottom + window.scrollY - 20  + "px"

	postMenu.querySelector("[data-action='delete']").onclick = () => {
		document.documentElement.style.setProperty("--deletionIconsDisplay", "inline-block")
		sel(`[for="delete-${board}:${postNumber}"]`).click()
	}
}

function switchToTab(name) { // Переключение табов в виджете настроек
	let preferences = sel("#preferences")

	preferences.querySelector(`[data-tab]:not([hidden])`).setAttribute("hidden", "1")
	preferences.querySelector(`[data-tab="${name}"]`).removeAttribute("hidden")

	preferences.querySelector(`.tabs .active`).classList.remove("active")
	preferences.querySelector(`.tabs [onclick="switchToTab('${name}')"]`).classList.add("active")
}
