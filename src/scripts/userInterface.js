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
			sel('#deletePosts').setAttribute('hidden', '');
		}
	}, 1)
}

function deselectAllPosts() {
	for (checkbox of sel('[form="deletePosts"]:checked')) {
		checkbox.checked = false;
	}

	activatePostRemovalWidget();
}

/* Оверлей с картинкой */
function showImage(e, url) {
	if (!e.ctrlKey) {
		e.preventDefault();

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

			new Draggabilly('.widget#imageViewer .widgetBox');
			sel('.widget#imageViewer').removeAttribute('hidden');
		}

		img.src = url;
	}
};
