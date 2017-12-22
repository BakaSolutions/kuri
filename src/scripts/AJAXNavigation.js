function asyncLoadPage(uri, noScrolling = 0) {
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

		log('Asynchronously navigated to', uri);
		// document.querySelector('main').classList.remove('refreshing');


		if (!noScrolling) scrollTo(~uri.indexOf('#') ? uri.split('#')[1] : 'top'); // Scroll to top if hash not specified
	};

	xhr.open("GET", uri);
	xhr.send(null);
}

// Bind
(() => {
	document.querySelector('body').onclick = e => {
		let uri = e.target.getAttribute('href');

		if(uri && /^\/|^#/.test(uri)){ // Check if target is a link and if it is internal or hash-only
			e.preventDefault();

			if (uri == window.location.pathname) return
			else if (!uri.indexOf('#') || (~uri.indexOf('#') && uri.split('#')[0] == window.location.pathname)) scrollTo(uri.split('#')[1]) // For hash-only link
			else if (!uri.indexOf('/')) asyncLoadPage(uri); // For internal link
		}
	}

	document.onkeydown = (e) => {
		if (e.which == 116 && !e.ctrlKey) { // Async reloading
			e.preventDefault();
			asyncLoadPage(document.location.href, 1);
		}
	}
})()
