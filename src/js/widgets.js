const DRGS = [];
function toggleWidget(id) {
	const WDGT = document.querySelector(`.widget#${id}`);
  if (WDGT.style.display == 'flex'){
		WDGT.style.display = 'none';
		DRGS[id].destroy();
	} else{
		WDGT.style.display = 'flex';
		DRGS[id] = new Draggabilly(`#${id}`, {
			containment: 'body',
			handle: `#${id} .boxHandle`
		});
	}
};

/* Оверлей с картинкой */
function showImage(e, url) {
	if (!e.ctrlKey) {
		e.preventDefault();
		e.stopPropagation();

		const OVRL = document.querySelector('#imageViewer');
		const IMG = new Image();

		IMG.onload = () => {
			OVRL.appendChild(IMG);
			OVRL.style.display = 'flex';
		}

		IMG.src = url;
		OVRL.onclick = () => {
			OVRL.removeChild(IMG);
			OVRL.style.display = 'none';
		}
	}
};

while (true) {
	if (Draggabilly) {
		toggleWidget('replyForm');
		document.querySelector('#replyForm').style.position = 'fixed';
		document.querySelector('#replyForm .boxHandle').style.display = 'block';

		break
	}
}
