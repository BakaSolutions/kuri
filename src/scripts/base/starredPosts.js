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
	for (post of marker.getPostsList("starred")){
		let postDOM = await requestPost(post.board, post.thread, post.number)
		
		postDOM.dataset.op = false
		marker.markPosts(postDOM)
		time.recalculate(sel("time", postDOM))

		sel("#favourite .widgetBox .content").appendChild(postDOM)
	}
}