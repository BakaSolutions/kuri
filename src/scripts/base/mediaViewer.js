const media = {
	videoState: 0,

	init: function() {
		this.widget 	= sel(".widget#mediaViewer")
		this.widgetBox 	= this.widget.querySelector(".widgetBox")
		this.ntf		= null
		storage.defaults.settings.videoVolume = .5

		let stylesheet = createElement("style")

		if (/Gecko\//.test(navigator.userAgent)){
			stylesheet.innerText = "#mediaViewer #FFfix{position: absolute; height: 100%; width: 100%} #mediaViewer.video #FFfix{height: calc(100% - 40px)}"

			let FFfix = createElement("div", {id: "FFfix"})
			this.widgetBox.appendChild(FFfix)

			this.mFlag = 0;

			FFfix.onmousedown = () => this.mFlag = 0
			FFfix.onmousemove = () => this.mFlag = 1
			FFfix.onmouseup = 	() => this.mFlag ? 0 : this.togglePause()
		} else if (/Webkit\//.test(navigator.userAgent)){
			stylesheet.innerText = "#mediaViewer video{pointer-events: none} #mediaViewer video::-webkit-media-controls{pointer-events: auto}"
		}

		new Draggabilly(this.widgetBox, this.mFlag === undefined ? undefined : {
			handle: "#mediaViewer #FFfix"
		})

		document.head.appendChild(stylesheet)
		
		this.widgetBox.addEventListener("wheel", (event) => {
			event.preventDefault()
			media.zoom(event.deltaY > 0 ? 0.9 : 1.1)
		})
	},

	reset: function(title, width, height) {
		this.videoState = 0

		try{
			this.widgetBox.querySelector("img, video").remove()
		} catch(error) {} // Nothing to remove
		
		this.widgetBox.style.left 										= 0
		this.widgetBox.style.top  										= 0
		this.widget.querySelector(".mediaInfo :first-child").innerText 	= width && height ? `${width}x${height}` : ""
		this.widget.querySelector(".mediaInfo :last-child").innerText 	= title
	},

	prepare: function(uri, mime, name) {
		let decoderError = () => {
			notifications.remove(this.ntf)
			notifications.add({
				text: "Файл поврежден или формат не поддерживается",
				class: "notification",
				timeout: 5000
			})
		}

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

			video.onerror = decoderError

			video.src = uri

			video.onpause = video.onplay = () => {
				this.videoState = !this.videoState
			}
		} else{
			this.widget.classList.remove("video")

			let img = new Image()
			img.onload = () => {
				this.reset(name, img.naturalWidth, img.naturalHeight)
				this.display(img)
			}

			img.onerror = decoderError

			img.src = uri
		}
	},

	display: function(element) {
		this.widgetBox.appendChild(element)
		toggleWidget("mediaViewer")
		notifications.remove(this.ntf)
	},

	zoom: function(multiplier){
		let maxSize 		= window.innerWidth * 3,
			minSize 		= window.innerHeight / 5,
			mediaNode		= this.widgetBox.querySelector("*"),
			computedStyle 	= window.getComputedStyle(mediaNode, null),
			newHeight 		= multiplier * parseInt(computedStyle.getPropertyValue("height")),
			newWidth  		= multiplier * parseInt(computedStyle.getPropertyValue("width"))

		if (newHeight < maxSize && newWidth < maxSize && newHeight > minSize && newWidth > minSize) {
			mediaNode.style.maxHeight 	= "none"
			mediaNode.style.maxWidth 	= "none"
			mediaNode.style.height 		= newHeight + "px"
			mediaNode.style.width 		= newWidth  + "px"
		} else{
			console.error("Trying to set media width to", newWidth, "and height to", newHeight, "when minimum limit is", minSize, "and maximum limit is", maxSize)
		}
	},

	hide: function(){
		let video = this.widgetBox.querySelector("video")
		if (video) storage.set("settings.videoVolume", video.volume)
		
		toggleWidget("mediaViewer")
		this.reset()
	},

	togglePause: function(){
		try{
			let video = this.widgetBox.querySelector("video")
			this.videoState ? video.pause() : video.play()
		} catch(error){} // Not a video
	}
}