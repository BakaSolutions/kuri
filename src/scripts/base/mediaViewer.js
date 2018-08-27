const media = {
	init: function() {
		this.widget 	= sel(".widget#mediaViewer")
		this.widgetBox 	= this.widget.querySelector(".widgetBox")
		this.ntf		= null
		storage.defaults.settings.videoVolume = .5
	},

	reset: function(title, width, height) {
		this.widgetBox.innerHTML  										= ""
		this.widgetBox.style.left 										= 0
		this.widgetBox.style.top  										= 0
		this.widget.querySelector(".mediaInfo :first-child").innerText 	= width && height ? `${width}x${height}` : ""
		this.widget.querySelector(".mediaInfo :last-child").innerText 	= title
	},

	prepare: function(e, mime, name) {
		if (!e.ctrlKey && DEVICE == "desktop") {
			e.preventDefault()

			this.ntf = notifications.add({
				text: "Загрузка...",
				class: "notification",
				closable: false
			})

			if (mime.split("/")[0] == "video") {
				this.widget.classList.add("video")

				let video = createElement("video", {
					type: mime,
					controls: 1
				})

				video.onloadeddata = () => {
					this.reset(name, video.videoWidth, video.videoHeight)
					video.volume = storage.get("settings.videoVolume")
					this.display(video)
				}

				video.src = e.target.href
			} else{
				this.widget.classList.remove("video")

				let img = new Image()
				img.onload = () => {
					this.reset(name, img.naturalWidth, img.naturalHeight)
					this.display(img)
				}

				img.src = e.target.href
			}
		}
	},

	display: function(element) {
		this.widgetBox.appendChild(element)
		toggleWidget("mediaViewer")
		notifications.remove(this.ntf)
	},

	zoom: function(multiplier){
		if (!this.widget.classList.contains("video")){
			let maxSize 		= window.innerWidth * 3,
				minSize 		= window.innerHeight / 10,
				mediaNode		= this.widgetBox.querySelector("*"),
				computedStyle 	= window.getComputedStyle(mediaNode, null),
				newHeight 		= multiplier * parseInt(computedStyle.getPropertyValue("height")),
				newWidth  		= multiplier * parseInt(computedStyle.getPropertyValue("width"))

			if (newHeight < maxSize && newWidth < maxSize && newHeight > minSize && newWidth > minSize) {
				mediaNode.style.maxHeight 	= "none"
				mediaNode.style.maxWidth 	= "none"
				mediaNode.style.height 		= newHeight + "px"
				mediaNode.style.width 		= newWidth  + "px"

			if(newHeight > window.innerHeight || newWidth > window.innerWidth){
				this.widget.classList.add("draggable")
				this.draggie = new Draggabilly(this.widgetBox)
			} else if(this.draggie){
				this.widget.classList.remove("draggable")
				this.draggie.destroy()
			}

			} else{
				console.error("Trying to set media width to", newWidth, "and height to", newHeight, "when minimum limit is", minSize, "and maximum limit is", maxSize)
			}
		}
	},

	hide: function(){
		let video = this.widgetBox.querySelector("video")
		if (video) storage.set("settings.videoVolume", video.volume)
		
		toggleWidget("mediaViewer")
		this.reset()
	}
}