((...arg) => {
	function apply(uri, content, callback){
		let node;

		switch (uri.split('.').pop()) {
			case 'js':
				node = document.createElement('script');
				break
			case 'css':
				node = document.createElement('style');
				node.type = 'text/css'
				break
		}

		node.innerHTML = content;
		document.querySelector('head').appendChild(node);

		eval(callback)
	}

	async function request(uri, callback) {
		let xhr = new XMLHttpRequest();

		xhr.onload = e => xhr.status < 400 ? apply(uri, xhr.response, callback) : 0;
		xhr.onerror = e => console.log('error: ', uri, xhr, e);

		xhr.open('GET', uri);
		xhr.send(null);
	}

	for (let i = 0; i < arg.length; i++) {
		arg[i] instanceof Object 
		? request(`/${arg[i][0].split('.').pop()}/${arg[i][0]}`, arg[i][1]) 
		: request(`/${arg[i].split('.').pop()}/${arg[i]}`)
	}

})('masterLib.js', 
	'AJAXNavigation.js', 
	'userInterface.js', 
	['draggabilly.js', '(() => {if (sel("#replyForm")) initDraggableReplyForm()})()'])