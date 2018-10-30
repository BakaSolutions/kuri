const musicPlayer = {
	player: sel("#musicPlayer"),
	pauseButton: sel("#musicPlayer #pause"),
	progressBar: sel("#musicPlayer #progress"),
	title: sel("#musicPlayer #title"),
	track: new Audio()
}

function updateOverflow() {
	this.style.textOverflow = this.style.left === "0px" ? "ellipsis" : "unset";
	this.style.overflow = this.style.left === "0px" ? "hidden" : "unset";
	this.removeEventListener("transitionend", updateOverflow, false);
}

musicPlayer.title.addEventListener("mouseenter", function () {
	if(this.scrollWidth <= this.offsetWidth)
		return;
	this.style.left = -(this.scrollWidth - this.offsetWidth) + "px";
	this.addEventListener("transitionend", updateOverflow, false);
	setTimeout(updateOverflow.bind(this), 50);
})

musicPlayer.title.addEventListener("mouseleave", function () {
	if(this.scrollWidth <= this.offsetWidth)
		return;
	this.style.left = "0px";
	this.addEventListener("transitionend", updateOverflow, false);
})

musicPlayer.track.addEventListener("timeupdate", () => {
	let t = musicPlayer.track,
		p = musicPlayer.progressBar
	p.value = t.currentTime / t.duration * 100
})

musicPlayer.track.addEventListener("ended", () => {
	musicPlayer.pauseButton.innerHTML = "play_arrow"
})

musicPlayer.pauseButton.addEventListener("click", () => {
	let b = musicPlayer.pauseButton,
			t = musicPlayer.track

	if (b.innerHTML == "pause"){
		b.innerHTML = "play_arrow"
		t.pause()
	} else{
		b.innerHTML = "pause"
		t.play()

	}
})

musicPlayer.progressBar.addEventListener("change", () => {
	let t = musicPlayer.track,
			p = musicPlayer.progressBar
	t.currentTime = Math.floor(t.duration * p.value / 100)
})

function loadAudio(uri, trackname) {
	musicPlayer.player.removeAttribute("hidden")

	musicPlayer.title.innerHTML = trackname
	if (musicPlayer.track.src) {
		musicPlayer.track.pause()
		musicPlayer.track.src = null
	}
	musicPlayer.track.src = uri;
	musicPlayer.pauseButton.click()
}