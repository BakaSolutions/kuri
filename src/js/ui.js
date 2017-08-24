function spoil(button, thread) {
	const TARGET = thread ? button.parentNode.parentNode.parentNode.parentNode : button.parentNode.parentNode.parentNode;

	TARGET.className.indexOf('spoiled') > -1 ? TARGET.classList.remove('spoiled') : TARGET.classList.add('spoiled');
};

const CACHED_POSTS = {};

function displayFloatingPost(link) {
	const BOARD = link.href.split('/').shift();
	const NUMBER = link.href.split('#').pop();
	let postJson;

	if (!CACHED_POSTS.hasOwnProperty(NUMBER)){
		if (document.querySelector(`#wrapper-${NUMBER}`)) {
			CACHED_POSTS[NUMBER] = document.querySelector(`#wrapper-${NUMBER}`).cloneNode(true);
		} else {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', `https://tuderi.tumba.ch:48596/api/post.get?boardName=${BOARD}&postNumber=${NUMBER}`);
			xhr.onload = () => {
				postJson = xhr.response;
				console.log(postJson);
			};
			xhr.send(null);
		}
	}

	CACHED_POSTS[NUMBER].classList.add('floating');
	link.appendChild(CACHED_POSTS[NUMBER]);
}

/* Маскот */
let mascotShown = false;

function mascotAnimationFix() {
	const MSCT = document.querySelector('#mascot');

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
function setTheme(name = 'tumbach') {
  document.querySelector('body').dataset.theme = name;
	document.cookie = `theme=${name}; expires=31 Dec 9999 23:59:59 GMT; path=/`;
	console.log('set ', document.cookie);
}

function applyColor() {
	const THEME = document.querySelectorAll('[type="color"]');
	const MANUAL_EDITOR = document.querySelector('#generatedTheme');
	MANUAL_EDITOR.innerHTML = '';

	for (let i = 0; i < THEME.length; i++){
		const STRING = THEME[i];
		MANUAL_EDITOR.innerHTML += `--${STRING.getAttribute('name')}: ${STRING.value};\n`;
	}

	document.querySelector('style#customTheme').innerHTML = `body[data-theme="custom"]{${MANUAL_EDITOR.innerHTML}}`;
}

/* Виджеты */
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
}

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

function quickReply(postNumber) {
	document.querySelector("#replyFormShow").checked = true;

	const TEXTAREA = document.querySelector('#replyForm textarea');
	TEXTAREA.innerHTML += TEXTAREA.innerHTML ? `\n>>${postNumber}` : `>>${postNumber}`;
}

(() => {
	console.log('got ', document.cookie);
	setTheme(getCookie("theme"));
	toggleWidget('replyForm');
	document.querySelector('#replyForm').style.position = 'fixed';
	document.querySelector('#replyForm .boxHandle').style.display = 'block';
})()
