const musicPlayer = {
	pauseButton: sel("#musicPlayer #pause"),
	progressBar: sel("#musicPlayer #progress"),
	track: null
}

musicPlayer.pauseButton.addEventListener("click", () => {
	let b = musicPlayer.pauseButton,
			t = musicPlayer.track

	if (b.innerHTML == "pause"){
		b.innerHTML = "play_arrow"
		t.pause()
	} else{
		b.innerHTML = "pause"
		t.play()

		musicPlayer.track.addEventListener("timeupdate", () => {
			let t = musicPlayer.track,
					p = musicPlayer.progressBar

			p.value = t.currentTime / t.duration * 100
		})

		musicPlayer.track.addEventListener("ended", () => {
			musicPlayer.pauseButton.innerHTML = "play_arrow"
		})
	}
})

musicPlayer.progressBar.addEventListener("change", () => {
	let t = musicPlayer.track,
			p = musicPlayer.progressBar

	t.currentTime = t.duration * p.value / 100
})

function loadAudio(uri, trackname) {
	sel("#musicPlayer").removeAttribute("hidden")

	sel("#musicPlayer #title").innerHTML = trackname
	musicPlayer.track = new Audio(uri)
	musicPlayer.pauseButton.click()
}