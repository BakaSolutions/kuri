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

          parameters.timeout ? setTimeout(() => {
            el.classList.remove("newNotification")

            setTimeout(() => notifications.remove(id), 200);
          }, parameters.timeout) : 0
        });

        return id
    }
  },

  remove: function(id){
    setTimeout(() => {
      let el = sel(`[data-notification-id="${id}"]`)

      if (el) this.container.removeChild(el)
      else console.log("Element doesn't exist.")
    }, 100);
  }
}
