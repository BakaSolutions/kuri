let deletionForm = sel('#deletePosts');

deletionForm.addEventListener("submit", e => {
	e.preventDefault();

	let uri = deletionForm.action,
		options = {
			credentials: "include",
			method: "post",
			headers: {
				"X-Requested-With": "XMLHttpRequest"
			},
			body: new FormData(deletionForm)
		};

	fetch(uri, options)
	.then(response => {
		response.json().then(r => {
		notifications.add({
			text: "Постов удалено: " + r.deleted,
			timeout: 10000,
			class: 'notification'
		})
		asyncLoadPage(document.location.href, 1)
	})
	.catch(err => {
		console.log(err)
		notifications.add({
			text: "Ошибка постинга:<br>" + (err.message || err),
			timeout: 10000,
			class: 'notification'
		})
	})
	})
})
