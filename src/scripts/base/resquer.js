const loader = {
	request: function(uri) {
		fetch(uri).then(response => {
			if (response.status < 400) {
				response.text().then(r => {
					console.log("resquer succesfully loaded", uri)
					let node

					switch (uri.split(".").pop()) {
						case "js":
							node = document.createElement("script")
							node.type = "text/javascript"
							break

						case "css":
							node = document.createElement("style")
							node.type = "text/css"
							break
					}
					
					node.innerText = r
					document.querySelector("head").appendChild(node)
				})
			} else {
				throw response.statusText
			}
		}).catch(err => console.error("Fetch error occured:", err))
	},

	run: function(...items) {
		for (let item of items) this.request(item)
	}
}

loader.run("/js/themes.js")