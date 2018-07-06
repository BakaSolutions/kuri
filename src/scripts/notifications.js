const notifications = {
  container: sel("#notificationsContainer"),
  lastId: 0,

  add: function(parameters){
    if (this.container) {
      let id = this.lastId++

      createElement("div", {className: parameters.class, innerHTML: parameters.text})
        .then(el => {
					el.dataset.notificationId = id
          this.container.insertBefore(el, this.container.childNodes[0])

          setTimeout(() => el.classList.add("newNotification"), 50);

					if (parameters.timeout){
						setTimeout(() => {
							notifications.remove(id);
						}, parameters.timeout)
					}

					if(!parameters.nonclosable){
						el.onclick = () => {
							notifications.remove(id)
						}
					}
        });

        return id
    }
  },

	remove: function(id){
		setTimeout(() => {
			let el = sel(`[data-notification-id="${id}"]`)

			if (el){
				el.classList.remove("newNotification")
				setTimeout(() => {
					this.container.removeChild(el)
				}, 200)
			} else console.log("Element doesn't exist.")
		}, 100);
	}
}
