const musicPlayer = {
	player: sel("#musicPlayer"),
	pauseButton: sel("#musicPlayer #pause"),
	progressBar: sel("#musicPlayer #progress"),
	title: sel("#musicPlayer #title"),
	track: new Audio()
}

sel("main").addEventListener('click.attachment.audio', event => {
	let [href, _, name] = event.detail

	musicPlayer.player.removeAttribute("hidden")

	musicPlayer.title.innerHTML = name
	musicPlayer.track.src = href
	musicPlayer.pauseButton.click()
}, false)

musicPlayer.track.addEventListener("timeupdate", () => {
	let t = musicPlayer.track,
			p = musicPlayer.progressBar
	p.value = t.currentTime / t.duration * 100
})

musicPlayer.track.addEventListener("pause", () => {
	musicPlayer.pauseButton.innerHTML = "play_arrow"
})

musicPlayer.track.addEventListener("play", () => {
	musicPlayer.pauseButton.innerHTML = "pause"
})

musicPlayer.pauseButton.addEventListener("click", () => {
	let t = musicPlayer.track

	t.paused ? t.play() : t.pause()
})

musicPlayer.progressBar.addEventListener("input", () => {
	let t = musicPlayer.track,
			p = musicPlayer.progressBar
	t.currentTime = Math.floor(t.duration * p.value / 100)
})
