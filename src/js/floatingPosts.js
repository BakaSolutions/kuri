const CACHED_POSTS = {};

function displayFloatingPost(link) {
	const BOARD = link.href.split('/').shift();
	const NUMBER = link.href.split('#').pop();
	let postJson;

	if (!CACHED_POSTS.hasOwnProperty(NUMBER)){
		if (document.querySelector(`#wrapper-${NUMBER}`)) {
			CACHED_POSTS[NUMBER] = document.querySelector(`#wrapper-${NUMBER}`).cloneNode(true);
		} else {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', `https://tuderi.tumba.ch:48596/api/post.get?boardName=${BOARD}&postNumber=${NUMBER}`);
			xhr.onload = () => {
				postJson = xhr.response;
				console.log(postJson);
			};
			xhr.send(null);
		}
	}

	CACHED_POSTS[NUMBER].classList.add('floating');
	link.appendChild(CACHED_POSTS[NUMBER]);
};
