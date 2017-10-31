function asyncLoadPage(uri) {
	// document.querySelector('main').classList.add('refreshing');
	let xhr = new XMLHttpRequest();

	xhr.onload = async () => {
		let content = xhr.response;

		let main = /<main>([\s\S]*)<\/main>/.exec(content);
		document.querySelector('main').innerHTML = main[1];

		let title = /<title>(.+)<\/title>/.exec(content);
		document.querySelector('title').innerHTML = title[1];
		history.pushState({}, title, uri);

		if (!document.querySelector('#replyForm') && /id="replyForm"/.test(content)) {
			let replyForm = /<div id="replyForm" class="widget">([\s\S]*)<!--\/replyForm-->/.exec(content);

			document.querySelector('body').appendChild(
				await createElement('input', {
					'type': 'checkbox',
					'id': 'replyFormShow',
					'className': 'hidden'
				})
			);

			document.querySelector('body').appendChild(
				await createElement('div', {
					'id': 'replyForm',
					'className': 'widget',
					'innerHTML': replyForm[1]
				})
			);

			initDraggableReplyForm();
		};

		// document.querySelector('main').classList.remove('refreshing');
		log('Asynchronously navigated to', uri.split('#')[0]);
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
