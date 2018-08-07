const notifications = {
	container: sel("#notificationsContainer"),
	lastId: 0,

	add: function(parameters){
		console.log("new notification:", parameters.text)

		if (this.container) {
			let id = this.lastId++

			let el = createElement("div", {
				className: parameters.class,
				innerHTML: parameters.text
			})

			el.dataset.notificationId = id

			this.container.insertBefore(el, this.container.childNodes[0])

			setTimeout(() => {
				el.classList.add("newNotification")
			}, 50)

			if (parameters.timeout){
				setTimeout(() => {
					notifications.remove(id)
				}, parameters.timeout)
			}

			if(!parameters.hasOwnProperty("closable") || parameters.closable){
				el.classList.add("clickable")

				el.onclick = () => {
					notifications.remove(id)
				}
			}

			return id
		}
	},

	remove: function(id) {
		let el = sel(`[data-notification-id="${id}"]`)

		if (el){
			el.classList.remove("newNotification")
			setTimeout(() => {
				this.container.removeChild(el)
			}, 200)
		}
	}
}