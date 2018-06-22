const notifications = {
  container: sel("#notificationsContainer"),
  lastId: 0,

  add: function(parameters){
    if (this.container) {
      let id = this.lastId++

      createElement("div", {className: parameters.class, innerHTML: parameters.text})
        .then(el => {
          el.dataset.notificationId = id
          this.container.classList.remove("newNotification")

          setTimeout((container) => {
            this.container.classList.add("newNotification")
            this.container.insertBefore(el, this.container.childNodes[0])
          }, 100, this.container)
        })

        parameters.timeout ? setTimeout(() => {
          notifications.remove(id)
        }, parameters.timeout) : 0

        return id
    }
  },

  remove: function(id){
    let el = sel(`[data-notification-id="${id}"]`)

    if (el) this.container.removeChild(el)
    else console.log("Element doesn't exist.")
  }
}
