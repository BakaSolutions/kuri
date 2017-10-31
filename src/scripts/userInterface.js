const toggleWidget = id => sel('.widget#' + id).classList.toggle('hidden');

function spoilPost(button, thread) {
	let target = button.parentNode.parentNode.parentNode;
	if (thread) target = target.parentNode;

	target.classList.toggle('spoiled');
};

function initDraggableReplyForm() {
	if (document.querySelector('#replyForm') && screen.width > 414) {
		new Draggabilly('#replyForm', {
			containment: 'html',
			handle: '#replyForm .widgetHandle'
		});
	}
}

function initDraggables() {
	if (screen.width > 414) {
		let ids = ['preferences', 'search'];

		for (var id of ids) {
			new Draggabilly('#' + id, {
				containment: 'html',
				handle: `#${id} .widgetHandle`
			});
		}
	}
};

function quickReply(postNumber, threadNumber) {
	document.querySelector("#replyFormShow").checked = true;
	document.querySelector('#replyForm .widgetHandle').innerHTML = `Ответ в тред <span class="pseudoLink">#${threadNumber}</span><label for="replyFormShow" class="icon close"></label>`;

	document.querySelector('input#threadNumber').value = threadNumber;
	document.querySelector('#replyForm textarea').innerHTML += `>>${postNumber}\n`;
};
