const musicPlayer = {
	player: sel("#musicPlayer"),
	pauseButton: sel("#musicPlayer #pause"),
	progressBar: sel("#musicPlayer #progress"),
	title: sel("#musicPlayer #title"),
	track: new Audio()
}

sel("main").addEventListener('click.attachment.audio', event => {
	event.preventDefault()

	let [href, _, name] = event.detail,
			t = musicPlayer.track

	musicPlayer.player.removeAttribute("hidden")

	musicPlayer.title.innerHTML = name
	t.src = href
	t.currentTime = 0
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
