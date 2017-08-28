function spoil(button, thread) {
	const TARGET = thread ? button.parentNode.parentNode.parentNode.parentNode : button.parentNode.parentNode.parentNode;

	TARGET.className.indexOf('spoiled') > -1 ? TARGET.classList.remove('spoiled') : TARGET.classList.add('spoiled');
};
