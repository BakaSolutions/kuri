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
