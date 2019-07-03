// /api/v1/post.read

async function getThreadNumber(board, post) {
	let options = {
		method: "post", 
		body: new FormData()
	}

	options.body.append("board", board)
	options.body.append("post", post)

	return await fetch(FOXTAN_URL_BASE + "/api/v1/post.read", options)
		.then(response => {
			if (response.status == 200) {
				return response.json().then(json => json.threadNumber)
			}

			throw response.status
		})
		.catch(err => {
			console.log(err)
		})
}

async function requestPost(board, thread, post){
	return await fetch(`${window.location.origin}/${board}/res/${thread}.html`)
		.then(response => {
			if (response.status == 200) {
				return response.text()
					.then((data) => {
						return sel(
							`.post[data-number="${post}"]`, 
							(new DOMParser()).parseFromString(data, "text/html")
						).cloneNode(true)
					})
			}

			throw response.status
		})
		.catch(err => {
			console.log(err)
		})
}

async function initStarredList(){
	for (post of marker.getPostsWithMark("starred")){
		let postDOM = await requestPost(post[0], await getThreadNumber(...post), post[1])
		
		postDOM.dataset.op = false
		marker.markPosts(postDOM)
		time.recalculate(sel("time", postDOM))

		sel("#favourite .widgetBox .content").appendChild(postDOM)
	}
}