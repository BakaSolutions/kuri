function asyncLoadPage(uri, noScrolling = 0) {
	// document.querySelector('main').classList.add('refreshing');
	let xhr = new XMLHttpRequest();

	xhr.onload = () => {
		let content = xhr.response;

		let main = /<main>([\s\S]*)<\/main>/.exec(content);
		if (!main) {
			return location.href = uri;
		}
		document.querySelector('main').innerHTML = main[1];

		let title = /<title>(.+)<\/title>/.exec(content);
		document.querySelector('title').innerHTML = title[1] || '';
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

		console.log('Asynchronously navigated to', uri);
		// document.querySelector('main').classList.remove('refreshing');

		if (!noScrolling) scrollTo(~uri.indexOf('#') ? uri.split('#')[1] : 'top'); // Scroll to top if hash not specified
	};

	xhr.open("GET", uri);
	xhr.send(null);
}

// Бинд кликов
(() => {
	document.querySelector('body').onclick = e => {
		if (e.target.hasAttribute('href')){
			let uri = e.target.getAttribute('href').replace(window.location.host, "")

			if(/^(\/|#)/.test(uri) && !e.target.hasAttribute('download')){
				e.preventDefault()

				// Внутренние ссылки
				if (/^\//.test(uri)) asyncLoadPage(uri)
				
				// Ссылки на якоря
				else if (/^\#/.test(uri)) scrollTo(uri.split('#')[1])
			}
		}
	}
})()



