function spoilPost(button, thread) {
	let target = button.parentNode.parentNode.parentNode;
	if (thread) target = target.parentNode;

	target.classList.toggle('spoiled');
};

function initDraggableReplyForm() {
	if (document.querySelector('#replyForm') && screen.width > 414) {
		new Draggabilly('#replyForm', {
			containment: 'body',
			handle: '#replyForm .widgetHandle'
		});
	}
}