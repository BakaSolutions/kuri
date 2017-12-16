function asyncLoadPage(uri) {
	// document.querySelector('main').classList.add('refreshing');
	let xhr = new XMLHttpRequest();

	xhr.onload = () => {
		let content = xhr.response;

		let main = /<main>([\s\S]*)<\/main>/.exec(content);
		document.querySelector('main').innerHTML = main[1];

		let title = /<title>(.+)<\/title>/.exec(content);
		document.querySelector('title').innerHTML = title[1];
		history.pushState({}, title, uri);

		if (!document.querySelector('#replyForm') && /id="replyForm"/.test(content)) {
			let BODY = sel('body');
			let replyForm = /<div id="replyForm" class="widget">([\s\S]*)<!--\/replyForm-->/.exec(content);

			createElement('input', {
				'type': 'checkbox',
				'id': 'replyFormShow',
				'className': 'hidden'
			}).then(el => BODY.appendChild(el));

			createElement('div', {
				'id': 'replyForm',
				'className': 'widget',
				'innerHTML': replyForm[1]
			}).then(el => BODY.appendChild(el));

			initDraggableReplyForm();
		};

		if (~uri.indexOf('#')){
			document.getElementsByName(uri.split('#')[1])[0].scrollIntoView();
			history.replaceState(null, null, uri.split('#')[0]);
		}

		// document.querySelector('main').classList.remove('refreshing');
		log('Asynchronously navigated to', uri);
	};

	xhr.open("GET", uri);
	xhr.send(null);
}

// Bind
(async () => {
	document.querySelector('body').onclick = e => {
		let cur = document.location,
				uri = e.target.getAttribute('href');

		if(uri && !uri.indexOf('/')){
			e.preventDefault();
			asyncLoadPage(uri);
		}
	}

	document.onkeydown = (e) => {
		if (e.which == 116 && !e.ctrlKey) {
			e.preventDefault();
			asyncLoadPage(document.location.href);
		}
	}
})()
