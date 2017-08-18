/* Проверка, нажат ли конрол */
let controlPressed = false;

document.onkeyup = e => {
	if (e.keyCode == 17) controlPressed = false;
}

document.onkeydown = e => {
	if (e.keyCode == 17) controlPressed = true;
}

/* Маскот */
let mascotShown = false;

function mascotAnimationFix() {
	const MSCT = select('#mascot');

	if (mascotShown){
		MSCT.style.pointerEvents = 'none';
		MSCT.classList.remove('idle');
		setTimeout(() => {
			MSCT.style.pointerEvents = 'auto';
			mascotShown = false;
		}, 600)
	} else {
		MSCT.style.pointerEvents = 'none';
		setTimeout(() => {
			mascotShown = true;
			MSCT.style.pointerEvents = 'auto';
			MSCT.classList.add('idle');
		}, 600)
	}
}

/* Темы */
function setTheme(name) {
  select('body').dataset.theme = name;
  // Тут еще нужна хрень с сохранением этого дела в куки, но ее без сервера не потестить
}

function applyColor() {
	const THEME = document.querySelectorAll('[type="color"]');
	const MANUAL_EDITOR = select('#generatedTheme');
	clear(MANUAL_EDITOR);

	for (let i = 0; i < THEME.length; i++){
		const STRING = THEME[i];
		MANUAL_EDITOR.innerHTML += `--${STRING.getAttribute('name')}: ${STRING.value};\n`;
	}

	select('style#customTheme').innerHTML = `body[data-theme="custom"]{${MANUAL_EDITOR.innerHTML}}`;
}

/* Конами-код */
cheet('↑ ↑ ↓ ↓ ← → ← → b a', () => {
	const OVRL = select('.overlay#fullsizeImage');

	const DIV = document.createElement('div');
	DIV.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/Y0mbeQy93aI?autoplay=1" width="640" height="360" frameborder="0" allowfullscreen></iframe>';

	OVRL.appendChild(DIV);
	OVRL.style.display = 'flex';

	OVRL.onclick = () => {
		OVRL.removeChild(DIV);
		OVRL.style.display = 'none';
	}
})

/* Виджеты */
const DRGS = [];
function toggleWidget(id) {
	const WDGT = select(`.widget#${id}`);
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
}

/* Оверлей с картинкой */
function showImage(event, url) {
	if (!controlPressed) {
		event.preventDefault();
		event.stopPropagation();

		const OVRL = select('#imageViewer');
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
}

// Нотификации
function Notification(text = 'Всё норм, Саня, не забудь убрать эту хуйню, а то уебу.', type = 'notification', dispelTimeout = 5000) {
	let notificationFlow;

	if (document.querySelector('#notificationFlow')){
		notificationFlow = document.querySelector('#notificationFlow');
	} else{
		notificationFlow = document.createElement('div');
		notificationFlow.id = 'notificationFlow';
		document.querySelector('body').appendChild(notificationFlow);
	}

	const NOTIFICATION = document.createElement('div');
	NOTIFICATION.classList.add('notification', type);
	NOTIFICATION.innerHTML = text;

	this.show = function (){
		notificationFlow.appendChild(NOTIFICATION);
		setTimeout(function () {
			NOTIFICATION.outerHTML = '';
		}, dispelTimeout);
	}
}


function replyFormInit() {
	toggleWidget('replyForm');
	select('#replyForm').style.position = 'fixed';
	select('#replyForm .boxHandle').style.display = 'block';
}
