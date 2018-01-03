function spoilPost(button, thread) {
	let target = button.parentNode.parentNode.parentNode.parentNode;
	if (thread) target = target.parentNode;

	target.classList.toggle('spoiled');
}

function initDraggableReplyForm() {
	if (document.querySelector('#replyForm') && screen.width > 414) {
		new Draggabilly('#replyForm', {
			containment: 'html',
			handle: '#replyForm .widgetHandle'
		});
	}
}

function quickReply(postNumber, threadNumber) {
	document.querySelector("#replyFormShow").checked = true;
	document.querySelector('#replyForm [name="subject"]').placeholder = 'Имя';
	document.querySelector('#replyForm .widgetHandle').innerHTML = `Ответ в тред <span class="pseudoLink">#${threadNumber}</span><label for="replyFormShow" class="icon close"></label>`;

	document.querySelector('input#threadNumber').value = threadNumber;
	document.querySelector('#replyForm textarea').innerHTML += `>>${postNumber}\n`;
};

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
	for (checkbox of document.querySelectorAll('[form="deletePosts"]:checked')) {
		checkbox.checked = false;
	}

	activatePostRemovalWidget();
}

/* Оверлей с картинкой */
function showImage(e, url) {
	if (!e.ctrlKey) {
		e.preventDefault();
		e.stopPropagation();

		const OVRL = document.querySelector('#imageViewer .widgetBox'),
					IMG = new Image();

		IMG.onload = () => {
			OVRL.innerHTML = '';
			OVRL.appendChild(IMG);
			switchAttribute(sel('.widget#imageViewer'), 'hidden')
		}

		IMG.src = url;
	}
};
