const media = {
	playState: 0,

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
			FFfix.onclick = 	() => this.mFlag ? 0 : this.togglePause()
		} else if (/Webkit\//.test(navigator.userAgent)){
			stylesheet.innerText = "#mediaViewer video{pointer-events: none} #mediaViewer video::-webkit-media-controls{pointer-events: auto}"
		}

		document.head.appendChild(stylesheet)
		
		this.widgetBox.addEventListener("wheel", (event) => {
			event.preventDefault()
			media.zoom(event.deltaY > 0 ? 0.9 : 1.1)
		})

		this.dragElement = new Draggable(this.widgetBox, this.mFlag === undefined ? null : sel("#mediaViewer #FFfix"))
	},

	reset: function(title, width, height) {
		this.dragElement.reset()
		this.widget.querySelector(".mediaInfo :first-child").innerText = width && height ? `${width}x${height}` : ""
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

		let media, background

		if (mime.includes("video")) {
			media = createElement("video", {
				type: mime,
				controls: 1
			})

			media.onloadeddata = () => {
				this.reset(name, media.videoWidth, media.videoHeight)
				media.volume = storage.get("settings.videoVolume")
				this.display(media)
			}

			media.onpause = media.onplay = () => {
				this.playState = !this.playState
			}
			
			this.widget.classList.add("video")
		} else if (mime.includes("audio")) {
			background = createElement("video", {
				type: "video/mp4",
				controls: 0,
				loop: true,
				autoplay: true
			})

			// background.autoplay = true
			background.src = "/static/audiobackground.mp4"

			media = createElement("audio", {
				type: mime,
				controls: 1
			})

			media.onloadeddata = () => {
				this.reset(name, background.videoWidth, background.videoHeight)
				media.volume = storage.get("settings.videoVolume")
				this.display(media, background)
			}

			media.onpause = media.onplay = () => {
				this.playState = !this.playState
			}
			
			this.widget.classList.add("audio")
		} else {
			media = new Image()
			
			media.onload = () => {
				this.reset(name, media.naturalWidth, media.naturalHeight)
				this.display(media)
			}

		}

		media.onerror = decoderError
		media.src = uri

		this.background = background
		this.media = media
	},

	display: function(...elements) {
		elements.forEach(element => {
			this.widgetBox.appendChild(element)
		})
		toggleWidget("mediaViewer")
		notifications.remove(this.ntf)
	},

	zoom: function(multiplier){
		let node = this.media

		node.style.maxHeight = node.style.maxWidth = "none"
		node.style.width = `${multiplier * parseInt(window.getComputedStyle(node, null).getPropertyValue("width"))}px`
	},

	hide: function(){
		if (this.media.duration) storage.set("settings.videoVolume", this.media.volume)

		this.widget.classList.remove("audio")
		this.widget.classList.remove("video")
		this.playState = 0
		if (this.background) {
			this.background.remove()
		}
		this.media.remove()
		
		toggleWidget("mediaViewer")
		this.reset()
	},

	togglePause: function(){
		try{
			let media = this.media
			this.playState ? media.pause() : media.play()
		} catch(error) { }// Not video/audio
	}
}