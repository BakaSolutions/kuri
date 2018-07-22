((...args) => {
	function apply(uri, content, callback){
		let node;

		switch (uri.split('.').pop()) {
			case 'js':
				node = document.createElement('script');
				node.type = "text/javascript"
				break
			case 'css':
				node = document.createElement('style');
				node.type = "text/css"
				break
		}

		node.innerHTML = content;
		document.querySelector('head').appendChild(node);

		eval(callback) // TODO: Избавиться от коллбеков и инициализировать скрипты по-человечески
	}

	function request(uri, callback) {
		fetch(uri)
			.then(response => {
				if (response.status == 200) {
					response.text().then(data => apply(uri, data, callback))
				} else {
					throw response.status
				}
			})
			.catch(err => console.error("Resources fetch error occured:", err))
	}

	for (let arg of args) {
		if (arg instanceof Object){
			request(`/${arg[0].split('.').pop()}/${arg[0]}`, arg[1])
		} else{
			request(`/${arg.split('.').pop()}/${arg}`)
		}
	}

})('masterLib.js',
	['themes.js', 'initThemes()'],
	'AJAXNavigation.js',
	['userInterface.js', 'initInterface()'],
	'posting.js',
	'musicPlayer.js',
	'draggabilly.js',
	'notifications.js'
)
