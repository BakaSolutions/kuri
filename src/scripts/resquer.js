((...arg) => {
	function apply(uri, content){
		let node;

		switch (uri.split('.').pop()) {
			case 'js':
				node = document.createElement('script');
				node.innerHTML = content;
				break
			case 'css':
				node = document.createElement('style');
				node.type = 'text/css'
				node.innerHTML = content;
				break
		}

		document.querySelector('head').appendChild(node);
	}

	async function request(uri) {
		let xhr = new XMLHttpRequest();

		xhr.onload = () => {
			if (xhr.status < 400) apply(uri, xhr.response);
		};

		xhr.onerror = e => console.log('error: ', uri, xhr, e);

		xhr.open('GET', uri);
		xhr.send(null);
	}

	for (let i = 0; i < arg.length; i++) {
		let path = '/' + arg[i].split('.').pop() + '/' + arg[i];
		request(path);
	}

})('masterLib.js', 'AJAXNavigation.js', 'userInterface.js')