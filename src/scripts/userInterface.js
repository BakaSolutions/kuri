function spoilPost(button, thread) {
	let target = thread ? button.parentNode.parentNode.parentNode : button.parentNode.parentNode;
	target.className.indexOf('spoiled') > -1 ? target.classList.remove('spoiled') : target.classList.add('spoiled');
};
